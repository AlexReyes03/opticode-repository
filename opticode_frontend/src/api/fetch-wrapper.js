/**
 * Uso en servicios:
 *   import request from '@/api/fetch-wrapper';
 *   const data = await request('/api/...');          // GET sin body
 *   const data = await request('/api/...', { method: 'POST', body: { ... } }); // JSON
 *   const data = await request('/api/...', { method: 'POST', files: [{ field: 'file', file }] }); // multipart
 *
 * Endpoints que este módulo consume internamente:
 *   POST /api/auth/login/     — LoginView: recibe { email, password },
 *                               devuelve { access, refresh }. No se envía Authorization.
 *   POST /api/token/refresh/  — TokenRefreshView: recibe { refresh },
 *                               devuelve { access } y { refresh } si ROTATE_REFRESH_TOKENS=True.
 *   Rutas en `isAnonymousAuthEndpoint`: sin header Bearer (evita 401 por access expirado).
 *
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Tipos de archivo aceptados. Esta es la última capa de seguridad antes del envío:
 * cualquier archivo que no coincida con extensión Y MIME es rechazado en cliente.
 */
const ALLOWED_FILE_SPEC = {
  zip:  { extensions: ['.zip'],         mimeTypes: ['application/zip', 'application/x-zip-compressed'] },
  html: { extensions: ['.html', '.htm'], mimeTypes: ['text/html'] },
  css:  { extensions: ['.css'],         mimeTypes: ['text/css'] },
};

const ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_SPEC).flatMap((s) => s.extensions);
const ALLOWED_MIME_TYPES  = Object.values(ALLOWED_FILE_SPEC).flatMap((s) => s.mimeTypes);

let authHandlers  = null;
let errorHandlers = null;

/**
 * Proveedor de tokens JWT. Debe registrarse desde AuthContext al montar el provider
 * o tras cada login. Ejemplo de implementación en AuthContext.jsx:
 *
 *   setTokenProvider({
 *     getAccessToken:  () => localStorage.getItem('access_token'),
 *     getRefreshToken: () => localStorage.getItem('refresh_token'),
 *     setTokens: (access, refresh) => {
 *       if (access)  localStorage.setItem('access_token', access);
 *       if (refresh) localStorage.setItem('refresh_token', refresh);
 *     },
 *   });
 *
 * @type {{ getAccessToken: () => string|null, getRefreshToken: () => string|null, setTokens: (access: string, refresh: string) => void } | null}
 */
let tokenProvider = null;

/**
 * Registra callbacks para errores de autenticación.
 * @param {{ handleAuthError: (status: number, message: string, endpoint: string, hadToken: boolean) => void }} handlers
 */
export const setAuthHandlers = (handlers) => {
  authHandlers = handlers;
};

/**
 * Registra callbacks para errores de servidor (500, 503, red).
 * @param {{ handleServerError: (status: number, message: string) => void }} handlers
 */
export const setErrorHandlers = (handlers) => {
  errorHandlers = handlers;
};

/**
 * Registra el proveedor de tokens. Llamar desde AuthContext.
 * @param {{ getAccessToken: () => string|null, getRefreshToken: () => string|null, setTokens: (access: string, refresh: string) => void }} provider
 */
export const setTokenProvider = (provider) => {
  tokenProvider = provider;
};

const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1500,
  retryStatuses: [503],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (status, attempt) =>
  attempt < RETRY_CONFIG.maxRetries && RETRY_CONFIG.retryStatuses.includes(status);

/**
 * Valida extensión y MIME de un archivo. Lanza si no coincide con ZIP/HTML/CSS.
 * @param {File} file
 */
function validateAllowedFile(file) {
  if (!(file instanceof File)) throw new Error('Se esperaba un objeto File.');
  const ext    = ALLOWED_EXTENSIONS.find((e) => file.name.toLowerCase().endsWith(e));
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.type);
  if (!ext || !mimeOk) {
    throw new Error(
      `Tipo de archivo no permitido. Aceptados: ${ALLOWED_EXTENSIONS.join(', ')}.`
    );
  }
}

/**
 * Construye el FormData para peticiones multipart. Cada archivo es validado antes de añadirse.
 * Los campos de `body` se serializan como strings o JSON si son objetos.
 * @param {{ body?: Record<string, unknown>, files: Array<{ field: string, file: File }> }} options
 * @returns {FormData}
 */
function buildMultipartBody({ body = {}, files }) {
  const form = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, typeof value === 'object' && !(value instanceof File) ? JSON.stringify(value) : value);
    }
  });
  for (const { field, file } of files) {
    validateAllowedFile(file);
    form.append(field, file, file.name);
  }
  return form;
}

/**
 * Llama a POST /api/token/refresh/ con el refresh token almacenado.
 * Compatible con ROTATE_REFRESH_TOKENS=True: si el backend devuelve un nuevo `refresh`, se persiste.
 * @returns {Promise<{ access: string, refresh?: string }>}
 */
async function refreshAccessToken() {
  const refresh = tokenProvider?.getRefreshToken?.();
  if (!refresh) throw new Error('No hay refresh token disponible.');

  const res  = await fetch(`${BASE_URL.replace(/\/$/, '')}/api/token/refresh/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refresh }),
  });
  const text = await res.text();
  let data   = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(data?.detail ?? data?.message ?? 'Error al refrescar el token.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Mensaje legible desde cuerpos JSON de DRF o APIs propias (login devuelve `{ error: "..." }`).
 * @param {unknown} data
 * @returns {string|null}
 */
function messageFromErrorBody(data) {
  if (data == null || typeof data !== 'object') return null;
  const d = data;
  if (typeof d.detail === 'string') return d.detail;
  if (Array.isArray(d.detail) && d.detail.length && typeof d.detail[0] === 'string') {
    return d.detail[0];
  }
  if (typeof d.message === 'string') return d.message;
  if (typeof d.error === 'string') return d.error;
  if (Array.isArray(d.error) && d.error.length) return String(d.error[0]);
  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
    return String(d.non_field_errors[0]);
  }
  return null;
}

function firstStringFromValue(value) {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = firstStringFromValue(item);
      if (nested) return nested;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      const nested = firstStringFromValue(nestedValue);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Primer mensaje en cuerpos DRF tipo `{ email: ["ya existe"], ... }`.
 * @param {unknown} data
 * @returns {string|null}
 */
function firstFieldValidationMessage(data) {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return null;
  for (const val of Object.values(data)) {
    const nested = firstStringFromValue(val);
    if (nested) return nested;
  }
  return null;
}

function isGenericHttpMessage(message) {
  if (!message || typeof message !== 'string') return true;
  const raw = message.trim();
  if (!raw) return true;
  const generic = /^(?:\d{3}\s+)?(?:bad request|unauthorized|forbidden|not found|method not allowed|conflict|unprocessable entity|internal server error|service unavailable)[.!: ]*$/i;
  return generic.test(raw);
}

/**
 * Mensaje para mostrar en UI a partir de un Error lanzado por `request()` (opcional `.data`).
 * @param {unknown} err
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(err, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  if (!err || typeof err !== 'object') return fallback;
  const data = err.data;
  const fromBody = messageFromErrorBody(data);
  if (fromBody && !isGenericHttpMessage(fromBody)) return fromBody;
  const fieldMsg = firstFieldValidationMessage(data);
  if (fieldMsg && !isGenericHttpMessage(fieldMsg)) return fieldMsg;
  const msg = err.message;
  if (msg && !isGenericHttpMessage(msg)) return String(msg).trim();
  return fallback;
}

/**
 * Ejecuta el fetch y parsea la respuesta. Lanza un Error enriquecido con `.status` y `.data` si no es ok.
 * @param {string} url
 * @param {RequestInit} opts
 * @returns {Promise<{ data: unknown, status: number }>}
 */
async function doRequest(url, opts) {
  const res  = await fetch(url, opts);
  const text = await res.text();
  let data   = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = messageFromErrorBody(data) ?? res.statusText ?? 'Error en la petición.';
    const err = new Error(msg);
    err.status = res.status;
    err.data   = data;
    throw err;
  }
  return { data, status: res.status };
}

/**
 * Realiza una petición al backend. Gestiona JWT, refresco de token, retry en 503 y validación de archivos.
 *
 * @param {string} endpoint - Ruta relativa con trailing slash (ej. '/api/projects/').
 * @param {Object}  [options]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method='GET']
 * @param {Object|null} [options.body=null]
 *   Cuerpo de la petición. Si no se pasan `files`, se serializa como JSON.
 *   Si se pasan `files`, los campos de `body` se añaden como campos adicionales del FormData.
 * @param {Array<{ field: string, file: File }>} [options.files=[]]
 *   Archivos a enviar. Solo se aceptan ZIP, HTML y CSS (validado en cliente).
 *   Cuando se pasa este array, el Content-Type se gestiona automáticamente como multipart/form-data.
 * @param {Object} [options.headers={}] - Headers adicionales. No sobreescribir Authorization.
 * @param {AbortSignal} [options.signal] - Para cancelar la petición con AbortController.
 * @returns {Promise<unknown>} Datos parseados de la respuesta, o null si la respuesta es vacía.
 * @throws {Error} Con `.status` (0 = red, 4xx, 5xx) y `.data` (body del error del backend).
 *
 * @example <caption>GET</caption>
 * const projects = await request('/api/projects/');
 *
 * @example <caption>POST JSON</caption>
 * const project = await request('/api/projects/', { method: 'POST', body: { name: 'Web App' } });
 *
 * @example <caption>POST multipart con archivo ZIP</caption>
 * const result = await request('/api/upload/', {
 *   method: 'POST',
 *   files: [{ field: 'file', file: zipFile }],
 *   body: { project_id: 1 },
 * });
 */
export default async function request(
  endpoint,
  { method = 'GET', body = null, files = [], headers = {}, signal = undefined } = {}
) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL.replace(/\/$/, '')}${normalizedEndpoint}`;

  /**
   * Rutas donde no debe enviarse JWT: el backend valida el Bearer antes del cuerpo
   * (p. ej. login con access expirado en localStorage → 401 token_not_valid).
   * Tampoco deben disparar refresh automático ante 401.
   */
  const isAnonymousAuthEndpoint =
    normalizedEndpoint.includes('/api/auth/login') ||
    normalizedEndpoint.includes('/api/auth/register') ||
    normalizedEndpoint.includes('/api/auth/forgot-password') ||
    normalizedEndpoint.includes('/api/auth/reset-password') ||
    normalizedEndpoint.includes('/api/reset-password') ||
    normalizedEndpoint.includes('/api/token/refresh');

  let opts = { method, headers: { ...headers }, signal };

  const hasFiles = Array.isArray(files) && files.length > 0;
  if (hasFiles) {
    opts.body = buildMultipartBody({
      body: body && typeof body === 'object' && !(body instanceof FormData) ? body : {},
      files,
    });
  } else if (body !== null && body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  const attachAuth = () => {
    if (isAnonymousAuthEndpoint) return;
    const access = tokenProvider?.getAccessToken?.();
    if (access) opts.headers['Authorization'] = `Bearer ${access}`;
  };

  attachAuth();

  let lastError = null;
  let attempt   = 0;

  while (attempt <= RETRY_CONFIG.maxRetries) {
    try {
      const { data } = await doRequest(url, opts);
      return data ?? null;
    } catch (error) {
      lastError = error;

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        if (shouldRetry(503, attempt)) {
          attempt++;
          await delay(RETRY_CONFIG.retryDelay * attempt);
          continue;
        }
        errorHandlers?.handleServerError?.(0, 'Error de conexión. Verifica tu conexión a internet.');
        const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
        networkError.status = 0;
        throw networkError;
      }

      if (error.status === 401 && !isAnonymousAuthEndpoint && tokenProvider?.getRefreshToken && tokenProvider?.setTokens) {
        try {
          const tokens = await refreshAccessToken();
          tokenProvider.setTokens(tokens.access, tokens.refresh ?? tokenProvider.getRefreshToken());
          opts = { ...opts, headers: { ...opts.headers } };
          attachAuth();
          const { data } = await doRequest(url, opts);
          return data ?? null;
        } catch (refreshErr) {
          authHandlers?.handleAuthError?.(401, refreshErr.message ?? 'Sesión expirada.', normalizedEndpoint, true);
          throw refreshErr;
        }
      }

      /* Solo 401 implica sesión inválida; 403 es permiso sobre el recurso y no debe borrar tokens. */
      if (error.status === 401 && !isAnonymousAuthEndpoint) {
        authHandlers?.handleAuthError?.(
          error.status,
          error.message ?? 'No autorizado.',
          normalizedEndpoint,
          Boolean(tokenProvider?.getAccessToken?.())
        );
      }

      if (error.status === 500) {
        errorHandlers?.handleServerError?.(500, error.message ?? 'Error interno del servidor.');
      }

      if (error.status === 503 && shouldRetry(503, attempt)) {
        attempt++;
        await delay(RETRY_CONFIG.retryDelay * attempt);
        continue;
      }

      if (error.status === 503 && attempt >= RETRY_CONFIG.maxRetries) {
        errorHandlers?.handleServerError?.(503, 'El servicio no está disponible después de varios intentos.');
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error('Error inesperado en request.');
}
