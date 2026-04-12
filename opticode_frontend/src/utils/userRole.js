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

/**
 * Texto del sidebar: primer nombre si existe; si no, parte local del correo o nombre completo.
 *
 * @param {object|null} user
 * @returns {{ shortLabel: string, title: string }}
 */
export function getSidebarUserPresentation(user) {
  if (!user || typeof user !== 'object') {
    return { shortLabel: 'Usuario', title: 'Usuario' };
  }
  const first = typeof user.first_name === 'string' ? user.first_name.trim() : '';
  const last = typeof user.last_name === 'string' ? user.last_name.trim() : '';
  const full = [first, last].filter(Boolean).join(' ').trim();
  const email = typeof user.email === 'string' ? user.email.trim() : '';
  const localPart = email.includes('@') ? email.split('@')[0] : email;
  const shortLabel = first || localPart || full || 'Usuario';
  const title = full || email || shortLabel;
  return { shortLabel, title };
}
