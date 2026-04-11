import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserRole } from '../utils/userRole';

/**
 * @param {object|null} user
 * @returns {'/admin' | '/dashboard'}
 */
function getRedirectPath(user) {
  return getUserRole(user) === 'admin' ? '/admin' : '/dashboard';
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
