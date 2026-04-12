/**
 * Normaliza el perfil o payload JWT a un rol para guardias de ruta y UI.
 * Alineado con PrivateRoute / PublicRoute (Django: role, user_type, is_staff, is_superuser).
 *
 * @param {object|null} user
 * @returns {'admin' | 'user'}
 */
export function getUserRole(user) {
  if (!user || typeof user !== 'object') return 'user';
  const role = user.role ?? user.user_type;
  if (
    role === 'admin' ||
    role === 'staff' ||
    user.is_staff === true ||
    user.is_superuser === true
  ) {
    return 'admin';
  }
  return 'user';
}

/**
 * @param {object|null} user
 * @returns {boolean}
 */
export function isAdminUser(user) {
  return getUserRole(user) === 'admin';
}
