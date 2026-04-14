import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { loginUser } from '../api/auth-services';
import request, {
  getApiErrorMessage,
  setAuthHandlers,
  setErrorHandlers,
  setTokenProvider,
} from '../api/fetch-wrapper';
import { notifyError, notifyInfo } from '../utils/toast';

/**
 * Claves de localStorage para persistencia de tokens.
 * Django Simple JWT devuelve `access` y `refresh` en POST /api/auth/login/.
 */
const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

/**
 * Decodifica el payload de un JWT sin verificar la firma (solo lectura de claims).
 * La verificaci?n real ocurre en el backend en cada petici?n.
 * @param {string} token
 * @returns {object|null}
 */
function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) return null;
    let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Verifica si el access token ha expirado comparando el claim `exp` con Date.now().
 * @param {string|null} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

const AuthContext = createContext(null);
const GENERIC_HTTP_MESSAGE_REGEX =
  /^(?:\d{3}\s+)?(?:internal server error|bad request|unauthorized|forbidden|not found|service unavailable)[.!: ]*$/i;

/**
 * Provider de autenticaci?n. Debe envolverse dentro de BrowserRouter para
 * que los componentes consumidores puedan usar useNavigate si lo necesitan.
 *
 * Registra autom?ticamente el tokenProvider y los handlers en fetch-wrapper
 * para que todas las peticiones incluyan JWT y el refresh sea transparente.
 */
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEYS.ACCESS) ?? null);

  /**
   * Perfil del usuario: tras login o al hidratar sesi?n se rellena con GET /api/auth/me/.
   * Hasta entonces puede ser el payload decodificado del JWT (solo claims).
   * @type {object|null}
   */
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!stored || isTokenExpired(stored)) return null;
    return decodeJwtPayload(stored);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /** Aviso de intentos fallidos (solo 2–4); viene del backend en `failed_attempt`. */
  const [loginAttemptHint, setLoginAttemptHint] = useState(null);

  /** Limpia de forma manual el error actual del contexto */
  const clearError = useCallback(() => {
    setError(null);
    setLoginAttemptHint(null);
  }, []);

  /** Persiste ambos tokens y actualiza el estado React. */
  const storeTokens = useCallback((access, refresh) => {
    if (access) {
      localStorage.setItem(TOKEN_KEYS.ACCESS, access);
      setAccessToken(access);
      setUser(decodeJwtPayload(access));
    }
    if (refresh) {
      localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    }
  }, []);

  /** Elimina tokens del localStorage y resetea el estado. */
  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    setAccessToken(null);
    setUser(null);
  }, []);

  /**
   * Registra tokenProvider y handlers antes de que los hijos ejecuten sus `useEffect`
   * (p. ej. `getProjects`), para no enviar peticiones sin Bearer ni recibir 401 ? cierre de sesi?n.
   * `handleAuthError` usa window.location porque se invoca desde fetch-wrapper.
   */
  useLayoutEffect(() => {
    setTokenProvider({
      getAccessToken: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
      getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
      setTokens: storeTokens,
    });

    setAuthHandlers({
      handleAuthError: (_status, _message, _endpoint, hadToken) => {
        if (hadToken) {
          clearTokens();
          notifyInfo('Tu sesión expiró. Inicia sesión nuevamente.', {
            toastId: 'session-expired',
            autoClose: 2500,
          });
          window.setTimeout(() => {
            window.location.replace('/login');
          }, 250);
        }
      },
    });

    setErrorHandlers({
      handleServerError: (status, message) => {
        const friendlyByStatus = {
          0: 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
          500: 'Tuvimos un problema interno. Intenta de nuevo en unos momentos.',
          503: 'El servicio no está disponible por el momento. Intenta de nuevo más tarde.',
        };
        const safeMessage = typeof message === 'string' ? message.trim() : '';
        const shouldReplace = !safeMessage || GENERIC_HTTP_MESSAGE_REGEX.test(safeMessage);
        const userMessage = shouldReplace
          ? friendlyByStatus[status] ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
          : safeMessage;
        const toastIdByStatus = {
          0: 'server-error-network',
          500: 'server-error-500',
          503: 'server-error-503',
        };
        notifyError(userMessage, {
          toastId: toastIdByStatus[status] ?? `server-error-${status}`,
        });
      },
    });
  }, [storeTokens, clearTokens]);

  useEffect(() => {
    const access = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!access || isTokenExpired(access)) return undefined;
    let cancelled = false;
    request('/api/auth/me/', { method: 'GET' })
      .then((profile) => {
        if (!cancelled && profile && typeof profile === 'object') setUser(profile);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Inicia sesi?n contra POST /api/auth/login/ (LoginView de Simple JWT).
   * Persiste access y refresh en localStorage.
   * La navegaci?n tras el login es responsabilidad del componente consumidor.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<void>}
   * @throws {Error} con `.status` y `.data` si el backend rechaza las credenciales.
   */
  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      setError(null);
      setLoginAttemptHint(null);
      try {
        const data = await loginUser(credentials);
        storeTokens(data?.access, data?.refresh);
        if (data?.access) {
          try {
            const profile = await request('/api/auth/me/', { method: 'GET' });
            if (profile && typeof profile === 'object') setUser(profile);
          } catch {
            // Se mantiene el usuario derivado del JWT en storeTokens.
          }
        }
      } catch (err) {
        const status = Number(err?.status ?? 0);
        const isGlobalInfraError = status === 0 || status === 500 || status === 503;
        if (isGlobalInfraError) {
          setLoginAttemptHint(null);
        } else {
          setError(
            getApiErrorMessage(err, 'No se pudo iniciar sesión. Verifica correo y contraseña.'),
          );
          const data = err?.data;
          if (data && typeof data === 'object' && data.locked === true) {
            setLoginAttemptHint(null);
          } else {
            const n = Number(data?.failed_attempt);
            if (Number.isInteger(n) && n >= 2 && n <= 4) {
              setLoginAttemptHint(`Intento ${n}/5`);
            } else {
              setLoginAttemptHint(null);
            }
          }
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeTokens],
  );

  /**
   * Cierra sesi?n: invalida el refresh token en el backend (best-effort)
   * y limpia el estado local. La navegaci?n es responsabilidad del componente.
   *
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
    try {
      if (refresh) {
        await request('/api/auth/logout/', { method: 'POST', body: { refresh } });
      }
    } catch {
      // El logout local siempre procede aunque el servidor falle.
    } finally {
      clearTokens();
    }
  }, [clearTokens]);

  /**
   * Actualiza el perfil en memoria desde GET /api/auth/me/ (p. ej. tras cambiar contraseña).
   * @returns {Promise<void>}
   */
  const refreshUser = useCallback(async () => {
    const access = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!access || isTokenExpired(access)) return;
    try {
      const profile = await request('/api/auth/me/', { method: 'GET' });
      if (profile && typeof profile === 'object') setUser(profile);
    } catch {
      // Sin efecto si la sesión ya no es válida.
    }
  }, []);

  /**
   * Indica si el usuario tiene un access token v?lido y no expirado.
   * Usar para guardias de ruta o renderizado condicional.
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(() => !isTokenExpired(localStorage.getItem(TOKEN_KEYS.ACCESS)), []);

  const value = useMemo(
    () => ({
      user,
      token: accessToken,
      login,
      logout,
      refreshUser,
      clearError,
      isAuthenticated,
      loading,
      error,
      loginAttemptHint,
    }),
    [
      user,
      accessToken,
      login,
      logout,
      refreshUser,
      clearError,
      isAuthenticated,
      loading,
      error,
      loginAttemptHint,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para consumir el contexto de autenticaci?n.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   login: (credentials: { email: string, password: string }) => Promise<void>,
 *   logout: () => Promise<void>,
 *   refreshUser: () => Promise<void>,
 *   clearError: () => void,
 *   isAuthenticated: () => boolean,
 *   loading: boolean,
 *   error: string|null,
 *   loginAttemptHint: string|null,
 * }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
};
