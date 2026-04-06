/**
 * Persistencia opcional de resultados de análisis en el cliente (desarrollo / sin API).
 * Clave: oc_audit_<projectId>_<fileId>
 */

/** @param {string|number} projectId @param {string|number} fileId */
const buildKey = (projectId, fileId) => `oc_audit_${projectId}_${fileId}`;

/**
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @param {{ findings: Array<object>, score: number, criticalCount: number, warningCount: number }} result
 */
export const storeAuditResult = (projectId, fileId, result) => {
  try {
    localStorage.setItem(buildKey(projectId, fileId), JSON.stringify(result));
  } catch {
    // cuota excedida
  }
};

/**
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {{ findings: Array<object>, score: number, criticalCount: number, warningCount: number } | null}
 */
export const loadAuditResult = (projectId, fileId) => {
  try {
    const raw = localStorage.getItem(buildKey(projectId, fileId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
