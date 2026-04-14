import request from './fetch-wrapper';
import { buildRsaCiphersForPlainMap } from './auth-crypto';

/**
 * Servicios de autenticación. Todas las peticiones pasan por fetch-wrapper
 * (JWT, refresh y manejo de errores).
 *
 * Endpoints confirmados en el backend:
 *   GET  /api/auth/crypto/public-key/ — clave pública RSA-OAEP (features.auth.AuthPublicKeyView).
 *   POST /api/auth/register/   — registro de usuario (features.auth.RegisterView).
 *   POST /api/auth/login/      — obtención de tokens Simple JWT (features.auth.LoginView).
 *
 * TODO(compatibilidad): El frontend debe apuntar a /api/auth/token/refresh/
 * para mantener la compatibilidad real con el refresh token.
 */

/**
 * Registro de usuario.
 *
 * Backend: POST /api/auth/register/
 * Con RSA: { email_cipher, password_cipher, key_id, first_name, last_name }.
 * Sin RSA: { email, password, first_name, last_name }.
 *
 * @param {Object} data - { email, password, first_name, last_name }
 * @returns {Promise<object>}
 */
export async function registerUser(data) {
  const first_name = String(data?.first_name ?? '').trim();
  const last_name = String(data?.last_name ?? '').trim();
  const email = String(data?.email ?? '').trim();
  const password = String(data?.password ?? '');

  const crypto = await buildRsaCiphersForPlainMap({ email, password });
  if (crypto.usePlain) {
    return request('/api/auth/register/', {
      method: 'POST',
      body: {
        email: crypto.plain.email,
        password: crypto.plain.password,
        first_name,
        last_name,
      },
    });
  }
  return request('/api/auth/register/', {
    method: 'POST',
    body: {
      email_cipher: crypto.ciphers.email_cipher,
      password_cipher: crypto.ciphers.password_cipher,
      key_id: crypto.key_id,
      first_name,
      last_name,
    },
  });
}

/**
 * Inicio de sesión. Devuelve access y refresh token (Simple JWT).
 *
 * Con RSA: { email_cipher, password_cipher, key_id }.
 * Sin RSA: { email, password }.
 *
 * Errores (backend / throttling):
 * - 401 credenciales incorrectas: `{ error: string, failed_attempt?: number }` (`failed_attempt` 1–4; el UI muestra aviso solo para 2–4).
 * - 403 cuenta bloqueada (5 fallos o ya bloqueada): `{ error: string, locked: true }`.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access: string, refresh: string }>}
 */
export async function loginUser(credentials) {
  const email = String(credentials?.email ?? '').trim();
  const password = String(credentials?.password ?? '');

  const crypto = await buildRsaCiphersForPlainMap({ email, password });
  if (crypto.usePlain) {
    return request('/api/auth/login/', {
      method: 'POST',
      body: { email: crypto.plain.email, password: crypto.plain.password },
    });
  }
  return request('/api/auth/login/', {
    method: 'POST',
    body: {
      email_cipher: crypto.ciphers.email_cipher,
      password_cipher: crypto.ciphers.password_cipher,
      key_id: crypto.key_id,
    },
  });
}

/**
 * Solicitud de restablecimiento de contraseña (envío de correo con enlace).
 *
 * @param {{ email: string }} data
 * @returns {Promise<object>}
 */
export const forgotPassword = (data) =>
  request('/api/auth/forgot-password/', { method: 'POST', body: data });

/**
 * Confirmación de nueva contraseña con el token recibido por correo.
 *
 * @param {{ uid: string, token: string, new_password: string }} data
 * @returns {Promise<object>}
 */
export const resetPassword = (data) =>
  request('/api/reset-password/', { method: 'POST', body: data });

/**
 * Cambio de contraseña para el usuario autenticado.
 *
 * Con RSA: { current_password_cipher, new_password_cipher, confirm_password_cipher, key_id }.
 * Sin RSA: { current_password, new_password, confirm_password }.
 *
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 * @returns {Promise<object>}
 */
export async function changePassword(data) {
  const current_password = String(data?.currentPassword ?? '');
  const new_password = String(data?.newPassword ?? '');
  const confirm_password = String(data?.confirmPassword ?? '');

  const crypto = await buildRsaCiphersForPlainMap({
    current_password,
    new_password,
    confirm_password,
  });

  if (crypto.usePlain) {
    return request('/api/auth/change-password/', {
      method: 'POST',
      body: {
        current_password: crypto.plain.current_password,
        new_password: crypto.plain.new_password,
        confirm_password: crypto.plain.confirm_password,
      },
    });
  }

  return request('/api/auth/change-password/', {
    method: 'POST',
    body: {
      current_password_cipher: crypto.ciphers.current_password_cipher,
      new_password_cipher: crypto.ciphers.new_password_cipher,
      confirm_password_cipher: crypto.ciphers.confirm_password_cipher,
      key_id: crypto.key_id,
    },
  });
}
