import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Determina la ruta de redirección según el rol del usuario (payload del JWT).
 * Compatible con claims habituales de Django: role, is_staff, is_superuser.
 *
 * @param {object|null} user - Payload decodificado del JWT (AuthContext.user).
 * @returns {'/admin' | '/dashboard'}
 */
function getRedirectPath(user) {
  if (!user || typeof user !== 'object') return '/dashboard';
  const role = user.role ?? user.user_type;
  if (role === 'admin' || role === 'staff' || user.is_staff === true || user.is_superuser === true) {
    return '/admin';
  }
  return '/dashboard';
}

/**
 * Guardia para rutas públicas (login, register, forgot-password, reset-password).
 * - Sin usuario autenticado: renderiza el Outlet (formularios de auth).
 * - Con usuario autenticado: redirige a /dashboard o /admin según el rol del user.
 *
 * Debe usarse dentro de AuthProvider y BrowserRouter.
 */
const PublicRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    const path = getRedirectPath(user);
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
