/** Longitud máxima por línea mostrada en UI (evita DOM pesado). */
const MAX_LINE_LENGTH = 4000;

/**
 * Normaliza y limita texto de snippets para visualización segura.
 * No interpreta HTML (ErrorCard usa texto escapado por React).
 * Elimina caracteres de control C0 excepto tab y newline.
 *
 * @param {string} text
 * @returns {string}
 */
export const sanitizeSnippetLine = (text) => {
  if (text == null) return '';
  let s = String(text);
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (s.length > MAX_LINE_LENGTH) {
    s = `${s.slice(0, MAX_LINE_LENGTH)}\u2026`; // …
  }
  return s;
};

/**
 * @param {string} text
 * @returns {string}
 */
export const sanitizeDescriptionText = (text) => sanitizeSnippetLine(text);
