/**
 * Servicios de Administración
 * 
 * Endpoints utilizados:
 * - GET /api/users/ : Lista todos los usuarios.
 * - PATCH /api/users/{id}/suspend/ : Suspende un usuario.
 * 
 * Respuesta esperada:
 * - getUsers devuelve un arreglo de usuarios ignorando la paginación.
 */
import request from './fetch-wrapper';

/**
 * @param {Record<string, unknown>} u
 * @returns {{ id: number, name: string, email: string, registeredAt: string, status: 'active' | 'suspended' }}
 */
function mapUserListRow(u) {
  const first = typeof u.first_name === 'string' ? u.first_name.trim() : '';
  const last = typeof u.last_name === 'string' ? u.last_name.trim() : '';
  const fromNames = [first, last].filter(Boolean).join(' ').trim();
  const email = typeof u.email === 'string' ? u.email.trim() : '';
  const name = fromNames || email || '—';
  const iso = u.date_joined;
  let registeredAt = '—';
  if (iso) {
    const d = new Date(String(iso));
    if (!Number.isNaN(d.getTime())) {
      try {
        registeredAt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(d);
      } catch {
        registeredAt = '—';
      }
    }
  }
  const active = u.is_active !== false;
  return {
    id: Number(u.id),
    name,
    email: email || '—',
    registeredAt,
    status: active ? 'active' : 'suspended',
  };
}

export const getUsers = () =>
  request('/api/users/', { method: 'GET' }).then((res) => {
    const raw = res?.results ?? res ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((u) => mapUserListRow(u && typeof u === 'object' ? u : {}));
  });

export const suspendUser = (id) =>
  request(`/api/users/${id}/suspend/`, { method: 'PATCH' });
