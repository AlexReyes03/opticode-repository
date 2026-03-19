import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Normaliza el payload del JWT a un rol único para comparar con allowedRoles.
 * Compatible con claims de Django: role, user_type, is_staff, is_superuser.
 *
 * @param {object|null} user - Payload decodificado del JWT (AuthContext.user).
 * @returns {'admin' | 'user'}
 */
function getRole(user) {
  if (!user || typeof user !== 'object') return 'user';
  const role = user.role ?? user.user_type;
  if (role === 'admin' || role === 'staff' || user.is_staff === true || user.is_superuser === true) {
    return 'admin';
  }
  return 'user';
}

/**
 * Guardia para rutas privadas. Requiere usuario autenticado y rol dentro de allowedRoles.
 * - Sin usuario o sesión expirada: redirige a /login guardando from: location para volver tras login.
 * - Con usuario pero rol no permitido: redirige a /login (evita acceso por URL directa).
 * - Con usuario y rol permitido: renderiza Outlet (AppLayout y vistas hijas).
 *
 * Debe usarse dentro de AuthProvider y BrowserRouter.
 *
 * @param {Object} props
 * @param {Array<'admin'|'user'>} [props.allowedRoles] - Roles que pueden acceder a las rutas hijas. Por defecto ['user', 'admin'].
 */
const PrivateRoute = ({ allowedRoles = ['user', 'admin'] }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const toLogin = <Navigate to="/login" state={{ from: location }} replace />;

  if (!isAuthenticated()) {
    return toLogin;
  }

  const role = getRole(user);
  const hasAllowedRole = Array.isArray(allowedRoles) && allowedRoles.includes(role);

  if (!hasAllowedRole) {
    return toLogin;
  }

  return <Outlet />;
};

export default PrivateRoute;
