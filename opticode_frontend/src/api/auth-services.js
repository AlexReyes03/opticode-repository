import request from './fetch-wrapper';

/**
 * Servicios de autenticación. Todas las peticiones pasan por fetch-wrapper
 * (JWT, refresh y manejo de errores). Los payloads están pensados para
 * integrarse con endpoints Django/DRF estándar.
 *
 * Endpoints esperados en el backend:
 *   POST /api/register/           — registro de usuario.
 *   POST /api/login/               — obtención de tokens (Simple JWT).
 *   POST /api/forgot-password/     — solicitud de restablecimiento.
 *   POST /api/reset-password/      — confirmación con token/uid.
 */

/**
 * Registro de usuario.
 *
 * Backend esperado: POST /api/register/
 * Body: { email, password, ... } (campos adicionales según el backend).
 * Respuesta típica: 201 con datos del usuario o 400 con errores de validación.
 *
 * @param {Object} data - { email: string, password: string, ... }
 * @returns {Promise<object>} Respuesta del backend (usuario creado o detalle de error).
 */
export const registerUser = (data) =>
  request('/api/register/', { method: 'POST', body: data });

/**
 * Inicio de sesión. Devuelve access y refresh token (Simple JWT).
 * La persistencia de tokens la gestiona AuthContext tras llamar a loginUser.
 *
 * Backend esperado: POST /api/login/
 * Body: { username, password } o { email, password } según configuración del backend.
 * Respuesta: { access: string, refresh: string }.
 *
 * @param {{ username?: string, email?: string, password: string }} credentials
 * @returns {Promise<{ access: string, refresh: string }>}
 */
export const loginUser = (credentials) =>
  request('/api/login/', { method: 'POST', body: credentials });

/**
 * Solicitud de restablecimiento de contraseña (envío de correo con enlace).
 *
 * Backend esperado: POST /api/forgot-password/
 * Body: { email: string }.
 * Respuesta típica: 200/202 con mensaje genérico (por seguridad no se revela si el email existe).
 *
 * @param {{ email: string }} data
 * @returns {Promise<object>}
 */
export const forgotPassword = (data) =>
  request('/api/forgot-password/', { method: 'POST', body: data });

/**
 * Confirmación de nueva contraseña con el token recibido por correo.
 *
 * Backend esperado: POST /api/reset-password/
 * Body: { uid: string, token: string, new_password: string } (o solo token + new_password según el backend).
 * Respuesta típica: 200 con mensaje de éxito.
 *
 * @param {{ uid?: string, token: string, new_password: string }} data
 * @returns {Promise<object>}
 */
export const resetPassword = (data) =>
  request('/api/reset-password/', { method: 'POST', body: data });
