/** Longitud máxima por línea mostrada en UI (evita DOM pesado). */
const MAX_LINE_LENGTH = 4000;

/**
 * Decodifica entidades HTML comunes para mostrar snippets legibles.
 * React seguirá escapando la salida al renderizar texto.
 *
 * @param {string} text
 * @returns {string}
 */
const decodeHtmlEntities = (text) =>
  String(text)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');

/**
 * Elimina caracteres de control C0 y DEL, excepto tab/newline.
 *
 * @param {string} text
 * @returns {string}
 */
const stripControlChars = (text) => {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const isAllowedWhitespace = code === 9 || code === 10;
    const isDisallowedControl = (code >= 0 && code <= 31 && !isAllowedWhitespace) || code === 127;
    if (!isDisallowedControl) out += ch;
  }
  return out;
};

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
  let s = decodeHtmlEntities(text);
  s = s.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  s = stripControlChars(s);
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
