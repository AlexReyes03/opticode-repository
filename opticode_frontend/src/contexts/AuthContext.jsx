import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  setAuthHandlers,
  setErrorHandlers,
  setTokenProvider,
} from '../api/fetch-wrapper';
import request from '../api/fetch-wrapper';

/**
 * Claves de localStorage para persistencia de tokens.
 * Django Simple JWT devuelve `access` y `refresh` en POST /api/login/.
 */
const TOKEN_KEYS = {
  ACCESS:  'access_token',
  REFRESH: 'refresh_token',
};

/**
 * Decodifica el payload de un JWT sin verificar la firma (solo lectura de claims).
 * La verificación real ocurre en el backend en cada petición.
 * @param {string} token
 * @returns {object|null}
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
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

/**
 * Provider de autenticación. Debe envolverse dentro de BrowserRouter para
 * que los componentes consumidores puedan usar useNavigate si lo necesitan.
 *
 * Registra automáticamente el tokenProvider y los handlers en fetch-wrapper
 * para que todas las peticiones incluyan JWT y el refresh sea transparente.
 */
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(TOKEN_KEYS.ACCESS) ?? null
  );

  /**
   * `user` se obtiene decodificando el JWT payload.
   * Contiene el claim `user_id` (configurado en Django con USER_ID_CLAIM).
   * Para datos adicionales (email, rol, nombre) el componente debe llamar
   * a un endpoint /api/me/ tras el login y almacenar el resultado localmente.
   * @type {object|null}
   */
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!stored || isTokenExpired(stored)) return null;
    return decodeJwtPayload(stored);
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

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
   * Registra el tokenProvider y los handlers en fetch-wrapper.
   * Se ejecuta una sola vez al montar el provider.
   * `handleAuthError` usa window.location porque se invoca desde fuera
   * del ciclo de renderizado de React (dentro de fetch-wrapper).
   */
  useEffect(() => {
    setTokenProvider({
      getAccessToken:  () => localStorage.getItem(TOKEN_KEYS.ACCESS),
      getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
      setTokens:       storeTokens,
    });

    setAuthHandlers({
      handleAuthError: (_status, _message, _endpoint, hadToken) => {
        if (hadToken) {
          clearTokens();
          window.location.replace('/login');
        }
      },
    });

    setErrorHandlers({
      handleServerError: (_status, _message) => {
        // Efecto secundario global ante errores 500/503/red.
        // Extensible con un sistema de notificaciones (toasts, etc.).
      },
    });
  }, [storeTokens, clearTokens]);

  /**
   * Inicia sesión contra POST /api/login/ (TokenObtainPairView de Simple JWT).
   * Persiste access y refresh en localStorage.
   * La navegación tras el login es responsabilidad del componente consumidor.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<void>}
   * @throws {Error} con `.status` y `.data` si el backend rechaza las credenciales.
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await request('/api/login/', {
        method: 'POST',
        body: credentials,
      });
      storeTokens(data?.access, data?.refresh);
    } catch (err) {
      const message = err?.data?.detail ?? err?.message ?? 'Credenciales incorrectas.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeTokens]);

  /**
   * Cierra sesión: invalida el refresh token en el backend (best-effort)
   * y limpia el estado local. La navegación es responsabilidad del componente.
   *
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
    try {
      if (refresh) {
        await request('/api/logout/', { method: 'POST', body: { refresh } });
      }
    } catch {
      // El logout local siempre procede aunque el servidor falle.
    } finally {
      clearTokens();
    }
  }, [clearTokens]);

  /**
   * Indica si el usuario tiene un access token válido y no expirado.
   * Usar para guardias de ruta o renderizado condicional.
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(
    () => !isTokenExpired(localStorage.getItem(TOKEN_KEYS.ACCESS)),
    []
  );

  const value = useMemo(() => ({
    user,
    token: accessToken,
    login,
    logout,
    isAuthenticated,
    loading,
    error,
  }), [user, accessToken, login, logout, isAuthenticated, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para consumir el contexto de autenticación.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   login: (credentials: { email: string, password: string }) => Promise<void>,
 *   logout: () => Promise<void>,
 *   isAuthenticated: () => boolean,
 *   loading: boolean,
 *   error: string|null,
 * }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
};
