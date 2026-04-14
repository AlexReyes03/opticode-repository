import forge from 'node-forge';
import request from './fetch-wrapper';

const CACHE_TTL_MS = 5 * 60 * 1000;

/** Máximo de bytes UTF-8 por bloque RSA-OAEP SHA-256 con clave 2048 bits (~190). */
export const RSA_OAEP_SHA256_MAX_UTF8_BYTES = 190;

let bundleCache = { expiresAt: 0, data: null };

/**
 * Web Crypto (`crypto.subtle`) solo existe en contextos seguros (HTTPS, localhost, 127.0.0.1).
 * En HTTP con otro host (p. ej. IP de LAN) se usa `node-forge` para el mismo RSA-OAEP SHA-256.
 */
function isWebCryptoSubtleAvailable() {
  return (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.subtle === 'object' &&
    globalThis.crypto.subtle !== null
  );
}

/**
 * Invalida la caché de la clave pública (p. ej. tras rotación en servidor).
 */
export function clearAuthCryptoBundleCache() {
  bundleCache = { expiresAt: 0, data: null };
}

/**
 * @returns {Promise<{ enabled: boolean, public_key_pem?: string, key_id?: string }>}
 */
async function fetchAuthCryptoBundle() {
  const now = Date.now();
  if (bundleCache.data && now < bundleCache.expiresAt) {
    return bundleCache.data;
  }
  const data = await request('/api/auth/crypto/public-key/', { method: 'GET' });
  const safe = data && typeof data === 'object' ? data : { enabled: false };
  bundleCache = { data: safe, expiresAt: now + CACHE_TTL_MS };
  return safe;
}

/**
 * @param {string} text
 * @param {string} label - nombre del campo (mensajes de error)
 */
export function assertRsaOaepUtf8Length(text, label) {
  const bytes = new TextEncoder().encode(String(text ?? '')).length;
  if (bytes > RSA_OAEP_SHA256_MAX_UTF8_BYTES) {
    throw new Error(
      `${label} supera ${RSA_OAEP_SHA256_MAX_UTF8_BYTES} bytes en UTF-8; acorta el texto o desactiva RSA en el servidor.`,
    );
  }
}

/**
 * Convierte PEM SPKI a ArrayBuffer para importKey.
 * @param {string} pem
 * @returns {ArrayBuffer}
 */
function pemSpkiToArrayBuffer(pem) {
  const trimmed = String(pem ?? '').trim();
  const b64 = trimmed
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * RSA-OAEP SHA-256 + MGF1-SHA-256 (alineado con `cryptography` en el backend).
 * @param {string} publicKeyPem
 * @param {string} plainUtf8
 * @returns {Promise<string>} Base64 del ciphertext
 */
async function rsaOaepSha256EncryptWithSubtle(publicKeyPem, plainUtf8) {
  const key = await crypto.subtle.importKey(
    'spki',
    pemSpkiToArrayBuffer(publicKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    encoder.encode(plainUtf8),
  );
  const out = new Uint8Array(ciphertext);
  let binary = '';
  for (let i = 0; i < out.byteLength; i += 1) {
    binary += String.fromCharCode(out[i]);
  }
  return btoa(binary);
}

/**
 * Misma semántica que SubtleCrypto, pero funciona en orígenes HTTP no seguros.
 * @param {string} publicKeyPem
 * @param {string} plainUtf8
 * @returns {string} Base64 del ciphertext
 */
function rsaOaepSha256EncryptWithForge(publicKeyPem, plainUtf8) {
  const publicKey = forge.pki.publicKeyFromPem(String(publicKeyPem ?? '').trim());
  const md = forge.md.sha256.create();
  const encrypted = publicKey.encrypt(forge.util.encodeUtf8(String(plainUtf8 ?? '')), 'RSA-OAEP', {
    md,
    mgf1: { md: forge.md.sha256.create() },
  });
  return forge.util.encode64(encrypted);
}

/**
 * Prefiere Web Crypto en contextos seguros; si no hay `subtle`, usa node-forge.
 * @param {string} publicKeyPem
 * @param {string} plainUtf8
 * @returns {Promise<string>}
 */
async function rsaOaepSha256EncryptBase64(publicKeyPem, plainUtf8) {
  if (isWebCryptoSubtleAvailable()) {
    return rsaOaepSha256EncryptWithSubtle(publicKeyPem, plainUtf8);
  }
  return rsaOaepSha256EncryptWithForge(publicKeyPem, plainUtf8);
}

/**
 * Cifra un texto UTF-8 con la clave pública del backend, o indica modo plano.
 * @param {string} plainUtf8
 * @param {string} [fieldLabel='Campo']
 * @returns {Promise<
 *   | { usePlainPassword: true }
 *   | { usePlainPassword: false, password_cipher: string, key_id: string }
 * >}
 */
export async function buildPasswordCryptoFields(plainUtf8, fieldLabel = 'Campo') {
  assertRsaOaepUtf8Length(plainUtf8, fieldLabel);
  const bundle = await fetchAuthCryptoBundle();
  if (!bundle?.enabled || typeof bundle.public_key_pem !== 'string' || !bundle.public_key_pem.trim()) {
    return { usePlainPassword: true };
  }
  const password_cipher = await rsaOaepSha256EncryptBase64(
    bundle.public_key_pem,
    String(plainUtf8 ?? ''),
  );
  const key_id = typeof bundle.key_id === 'string' && bundle.key_id.trim()
    ? bundle.key_id.trim()
    : 'v1';
  return { usePlainPassword: false, password_cipher, key_id };
}

/**
 * Obtiene el bundle de cifrado una sola vez y cifra varias cadenas (misma key_id).
 * @param {Record<string, string>} plainByKey - p. ej. { email: 'a@b.com', password: 'x' }
 * @returns {Promise<
 *   | { usePlain: true, plain: Record<string, string> }
 *   | { usePlain: false, ciphers: Record<string, string>, key_id: string }
 * >}
 */
export async function buildRsaCiphersForPlainMap(plainByKey) {
  const entries = Object.entries(plainByKey).filter(([, v]) => v !== undefined && v !== null);
  for (const [key, val] of entries) {
    assertRsaOaepUtf8Length(String(val), key);
  }

  const bundle = await fetchAuthCryptoBundle();
  if (!bundle?.enabled || typeof bundle.public_key_pem !== 'string' || !bundle.public_key_pem.trim()) {
    return { usePlain: true, plain: Object.fromEntries(entries.map(([k, v]) => [k, String(v ?? '')])) };
  }

  const pem = bundle.public_key_pem;
  const key_id = typeof bundle.key_id === 'string' && bundle.key_id.trim()
    ? bundle.key_id.trim()
    : 'v1';

  /** @type {Record<string, string>} */
  const ciphers = {};
  for (const [k, v] of entries) {
    ciphers[`${k}_cipher`] = await rsaOaepSha256EncryptBase64(pem, String(v ?? ''));
  }
  return { usePlain: false, ciphers, key_id };
}
