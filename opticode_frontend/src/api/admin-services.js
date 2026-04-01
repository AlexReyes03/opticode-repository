/**
 * Servicios de Administración
 * 
 * Endpoints utilizados:
 * - GET /api/users/ : Lista todos los usuarios.
 * - POST /api/users/{id}/suspend/ : Alterna la suspensión de un usuario.
 * 
 * Respuesta esperada:
 * - getUsers devuelve un arreglo de usuarios ignorando la paginación.
 */
import request from './fetch-wrapper';

export const getUsers = () =>
  request('/api/users/', { method: 'GET' }).then(res => res?.results ?? res ?? []);

export const suspendUser = (id) =>
  request(`/api/users/${id}/suspend/`, { method: 'POST' });
