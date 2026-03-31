/**
 * Utilidad de persistencia para resultados del análisis WCAG estático local.
 *
 * Los resultados se indexan por (projectId, fileId) asignado por el backend
 * tras una subida exitosa. Permite que FileReport y ErrorDetail lean los
 * hallazgos generados por htmlSyntaxAnalyzer sin depender del endpoint de
 * auditoría del backend (que aún no está implementado).
 *
 * @module auditStorage
 */

/** @param {string|number} projectId @param {string|number} fileId @returns {string} */
const buildKey = (projectId, fileId) => `oc_audit_${projectId}_${fileId}`;

/**
 * Persiste el resultado de un análisis WCAG en localStorage.
 *
 * @param {string|number} projectId
 * @param {string|number} fileId - ID devuelto por el backend tras la subida.
 * @param {{ findings: Array<object>, score: number, criticalCount: number, warningCount: number }} result
 */
export const storeAuditResult = (projectId, fileId, result) => {
  try {
    localStorage.setItem(buildKey(projectId, fileId), JSON.stringify(result));
  } catch (_) {
    // Cuota de localStorage excedida — silencioso, no bloquea el flujo principal.
  }
};

/**
 * Recupera el resultado de un análisis WCAG previamente almacenado.
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {{ findings: Array<object>, score: number, criticalCount: number, warningCount: number } | null}
 */
export const loadAuditResult = (projectId, fileId) => {
  try {
    const raw = localStorage.getItem(buildKey(projectId, fileId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};
