/**
 * Analizador estático de sintaxis HTML — HU-3.1 (WCAG 4.1.1)
 *
 * Detecta dos categorías de malformación clasificadas como Falta Crítica Nivel A:
 *   1. Etiquetas de apertura sin su etiqueta de cierre correspondiente.
 *   2. Atributos duplicados dentro de la misma etiqueta.
 *
 * NOTA (WCAG 4.1.1): Este criterio fue eliminado de WCAG 2.2 por redundancia tecnológica,
 * pero el motor de auditoría del proyecto lo conserva como regla propia de calidad de código
 * dado que el anidamiento malformado sigue rompiendo la interpretación de lectores de pantalla.
 *
 * LIMITACIÓN DE SCOPE (ver HU-3.1 NOTA DEV): Este analizador opera sobre texto plano estático.
 * El contenido dinámico generado en tiempo de ejecución queda fuera de alcance y requeriría
 * parseo del DOM renderizado en vivo — tarea pendiente para un sprint futuro.
 */

/** Elementos que no requieren etiqueta de cierre (HTML5 void elements). */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Elementos cuyo contenido interno es texto plano (no HTML).
 * Las etiquetas que aparezcan dentro de <script> o <style> no deben parsearse.
 */
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

/**
 * Etiquetas con cierre opcional en HTML5.
 * Omitirlas del reporte evita falsos positivos en código válido.
 */
const OPTIONAL_CLOSE_ELEMENTS = new Set([
  'html', 'head', 'body',
  'li', 'dt', 'dd', 'p',
  'rt', 'rp',
  'optgroup', 'option',
  'colgroup', 'caption',
  'thead', 'tbody', 'tfoot',
  'tr', 'td', 'th',
]);

/**
 * Retorna el número de línea (1-based) correspondiente a una posición de caracteres en el texto.
 *
 * @param {string} text
 * @param {number} position
 * @returns {number}
 */
function getLineNumber(text, position) {
  return text.slice(0, position).split('\n').length;
}

/**
 * Extrae hasta 3 líneas de contexto alrededor de la línea objetivo para el snippet de código.
 *
 * @param {string[]} lines - Array de líneas del archivo.
 * @param {number} lineIdx - Índice 0-based de la línea objetivo.
 * @returns {Array<{ lineNumber: number, content: string }>}
 */
function extractCodeLines(lines, lineIdx) {
  const start = Math.max(0, lineIdx - 1);
  const end = Math.min(lines.length - 1, lineIdx + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    lineNumber: start + i + 1,
    content: lines[start + i] ?? '',
  }));
}

/**
 * Analiza la cadena de atributos de una etiqueta buscando nombres duplicados.
 * Retorna un hallazgo de tipo CRITICAL si encuentra duplicados, o null si no hay.
 *
 * @param {string} attrsString - Fragmento de la etiqueta después del nombre (ej. ` id="a" id="b"`).
 * @param {string} tagName
 * @param {number} lineNumber
 * @param {number} tagCharIndex - Posición del match en el texto original (para el id único).
 * @param {string[]} lines
 * @returns {object|null}
 */
function detectDuplicateAttributes(attrsString, tagName, lineNumber, tagCharIndex, lines) {
  if (!attrsString?.trim()) return null;

  const attrNameRegex = /\b([\w-]+)\s*(?:=\s*(?:"[^"]*"|'[^']*'|\S+))?/g;
  const seen = new Set();
  const duplicates = new Set();
  let match;

  while ((match = attrNameRegex.exec(attrsString)) !== null) {
    const name = match[1].toLowerCase();
    if (seen.has(name)) {
      duplicates.add(name);
    } else {
      seen.add(name);
    }
  }

  if (duplicates.size === 0) return null;

  const dupList = [...duplicates].map((d) => `"${d}"`).join(', ');

  return {
    id: `dup-attr-${tagCharIndex}`,
    severity: 'critical',
    level: 'Nivel A',
    wcag_rule: 'WCAG 4.1.1',
    title: `Atributo duplicado en <${tagName}>`,
    description:
      `La etiqueta <${tagName}> contiene los siguientes atributos duplicados: ${dupList}. ` +
      'Los atributos duplicados producen comportamiento indefinido: los navegadores y lectores ' +
      'de pantalla solo reconocen el primero e ignoran los demás, lo que puede ocultar ' +
      'información accesible crítica (WCAG 4.1.1).',
    line: lineNumber,
    codeLines: extractCodeLines(lines, lineNumber - 1),
  };
}

/**
 * Ejecuta el análisis de sintaxis estático sobre el contenido de un archivo HTML.
 *
 * @param {string} content - Contenido completo del archivo HTML.
 * @returns {{
 *   findings: Array<object>,
 *   score: number,
 *   criticalCount: number,
 *   warningCount: number,
 * }}
 */
export function analyzeHtmlSyntax(content) {
  const findings = [];
  const lines = content.split('\n');

  // Eliminar comentarios HTML para evitar falsos positivos en su interior.
  // Se preserva la longitud del texto para mantener las posiciones de caracteres válidas.
  const stripped = content.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));

  // Regex que captura: cierre(/), nombre de tag, atributos opcionales, auto-cierre(/)
  const TOKEN_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?\/?>/g;

  /** @type {Array<{ tagName: string, lineNumber: number, index: number }>} */
  const stack = [];

  /** Nombre del raw-text element activo (script/style), o null si no hay ninguno. */
  let rawTextContext = null;

  let match;
  while ((match = TOKEN_RE.exec(stripped)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const attrsString = match[3] ?? '';
    const isSelfClosed = match[0].endsWith('/>') || VOID_ELEMENTS.has(tagName);
    const lineNumber = getLineNumber(content, match.index);

    // Dentro de <script>/<style> solo buscamos la etiqueta de cierre del propio elemento.
    if (rawTextContext) {
      if (isClosing && tagName === rawTextContext) rawTextContext = null;
      continue;
    }

    if (!isClosing) {
      // --- Regla: atributos duplicados ---
      const dupFinding = detectDuplicateAttributes(
        attrsString, tagName, lineNumber, match.index, lines
      );
      if (dupFinding) findings.push(dupFinding);

      if (RAW_TEXT_ELEMENTS.has(tagName) && !isSelfClosed) {
        rawTextContext = tagName;
        continue;
      }

      if (!isSelfClosed) {
        stack.push({ tagName, lineNumber, index: match.index });
      }
    } else {
      // Etiqueta de cierre: emparejar con la apertura más reciente en el stack.
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tagName === tagName) {
          stack.splice(i, 1);
          break;
        }
      }
    }
  }

  // --- Regla: etiquetas sin cerrar ---
  // Lo que queda en el stack son aperturas sin cierre correspondiente.
  for (const unclosed of stack) {
    if (OPTIONAL_CLOSE_ELEMENTS.has(unclosed.tagName)) continue;

    findings.push({
      id: `unclosed-${unclosed.index}`,
      severity: 'critical',
      level: 'Nivel A',
      wcag_rule: 'WCAG 4.1.1',
      title: `Etiqueta <${unclosed.tagName}> sin cerrar`,
      description:
        `La etiqueta <${unclosed.tagName}> (línea ${unclosed.lineNumber}) no tiene su etiqueta ` +
        'de cierre correspondiente. El anidamiento malformado puede hacer que los lectores de ' +
        'pantalla interpreten incorrectamente la estructura semántica del documento (WCAG 4.1.1).',
      line: unclosed.lineNumber,
      codeLines: extractCodeLines(lines, unclosed.lineNumber - 1),
    });
  }

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;

  // Penalización: -15 por cada falta crítica, mínimo 0.
  const score = Math.max(0, 100 - criticalCount * 15);

  return { findings, score, criticalCount, warningCount };
}
