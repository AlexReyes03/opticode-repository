import request from './fetch-wrapper';

/**
 * Servicios de autenticación. Todas las peticiones pasan por fetch-wrapper
 * (JWT, refresh y manejo de errores).
 *
 * Endpoints confirmados en el backend:
 *   POST /api/auth/register/   — registro de usuario (features.auth.RegisterView).
 *   POST /api/auth/login/      — obtención de tokens Simple JWT (features.auth.LoginView).
 *
 * TODO(backend): Los siguientes endpoints aún no existen en el backend.
 * Deben implementarse antes de activar forgotPassword() y resetPassword():
 *   POST /api/auth/forgot-password/   — solicitud de restablecimiento por correo.
 *   POST /api/auth/reset-password/    — confirmación con uid + token.
 */

/**
 * Registro de usuario.
 *
 * Backend: POST /api/auth/register/ (features.auth.RegisterView — CreateAPIView).
 * Body: { email, password, ... } (campos según el serializer del backend).
 * Respuesta: 201 con datos del usuario creado, o 400 con errores de validación.
 *
 * @param {Object} data - { email: string, password: string, ... }
 * @returns {Promise<object>}
 */
export const registerUser = (data) =>
  request('/api/auth/register/', { method: 'POST', body: data });

/**
 * Inicio de sesión. Devuelve access y refresh token (Simple JWT).
 * La persistencia de tokens la gestiona AuthContext tras llamar a loginUser.
 *
 * Backend: POST /api/auth/login/ (features.auth.LoginView).
 * Body: { email: string, password: string }.
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
 * TODO(backend): Endpoint pendiente de implementar en el backend.
 * URL esperada: POST /api/auth/forgot-password/
 * Body: { email: string }.
 * Respuesta esperada: 200/202 con mensaje genérico (sin revelar si el email existe).
 *
 * @param {{ email: string }} data
 * @returns {Promise<object>}
 */
export const forgotPassword = (data) =>
  request('/api/auth/forgot-password/', { method: 'POST', body: data });

/**
 * Confirmación de nueva contraseña con el token recibido por correo.
 *
 * TODO(backend): Endpoint pendiente de implementar en el backend.
 * URL esperada: POST /api/auth/reset-password/
 * Body: { uid: string, token: string, new_password: string }.
 * Respuesta esperada: 200 con mensaje de éxito.
 *
 * @param {{ uid: string, token: string, new_password: string }} data
 * @returns {Promise<object>}
 */
export const resetPassword = (data) =>
  request('/api/auth/reset-password/', { method: 'POST', body: data });
