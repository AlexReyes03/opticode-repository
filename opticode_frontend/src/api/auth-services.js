import request from './fetch-wrapper';

/**
 * Servicios de autenticación. Todas las peticiones pasan por fetch-wrapper
 * (JWT, refresh y manejo de errores). Los payloads están pensados para
 * integrarse con endpoints Django/DRF estándar.
 *
 * Endpoints reales del backend (config/urls.py → features.auth.urls):
 *   POST /api/auth/register/       — registro de usuario.
 *   POST /api/auth/login/          — obtención de tokens (Simple JWT).
 *   POST /api/forgot-password/     — solicitud de restablecimiento.
 *   POST /api/reset-password/      — confirmación con token/uid.
 */

/**
 * Registro de usuario.
 *
 * Backend: POST /api/auth/register/
 * Body: { email, password, first_name, last_name }.
 * Respuesta típica: 201 con datos del usuario o 400 con errores de validación.
 *
 * @param {Object} data - { email: string, password: string, first_name: string, last_name: string }
 * @returns {Promise<object>} Respuesta del backend (usuario creado o detalle de error).
 */
export const registerUser = (data) =>
  request('/api/auth/register/', { method: 'POST', body: data });

/**
 * Inicio de sesión. Devuelve access y refresh token (Simple JWT).
 * La persistencia de tokens la gestiona AuthContext tras llamar a loginUser.
 *
 * Backend: POST /api/auth/login/
 * Body: { email, password }.
 * Respuesta: { access: string, refresh: string }.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access: string, refresh: string }>}
 */
export const loginUser = (credentials) =>
  request('/api/auth/login/', { method: 'POST', body: credentials });

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

