import request from './fetch-wrapper';

/**
 * Subida de un archivo HTML o CSS a un proyecto.
 * Backend: POST /api/projects/:projectId/files/upload/ (multipart, campo `file`).
 *
 * TODO(backend): Tras integrar run_audit() al guardar, la respuesta debe incluir `score` (float).
 * El front ya lee `data.score` en FileUpload; no hace falta cambiar el cliente una vez exista.
 *
 * @param {string|number} projectId
 * @param {File} file
 * @returns {Promise<{ id: number, filename: string, file_type: string, size_bytes: number, score?: number|null }>}
 */
export const uploadFile = (projectId, file) =>
  request(`/api/projects/${projectId}/files/upload/`, {
    method: 'POST',
    files: [{ field: 'file', file }],
  });

/**
 * Subida de un ZIP con varios HTML/CSS.
 * Backend: POST /api/projects/:projectId/files/upload-zip/ (multipart, campo `file`).
 *
 * TODO(backend): Cada objeto dentro de `uploaded[]` deberá incluir `score` cuando run_audit
 * corra tras cada archivo guardado. El front ya mapea `u.score` en FileUpload.
 *
 * @param {string|number} projectId
 * @param {File} file
 * @returns {Promise<{ uploaded: Array<{ id: number, filename: string, file_type: string, size_bytes: number, score?: number|null }>, ignored: Array<{ filename: string, reason: string }> }>}
 */
export const uploadZip = (projectId, file) =>
  request(`/api/projects/${projectId}/files/upload-zip/`, {
    method: 'POST',
    files: [{ field: 'file', file }],
  });

/**
 * Reporte agregado del archivo (nombre, puntuación, conteos por severidad, etc.).
 *
 * Backend esperado (S2-JM-02): GET /api/audit/:fileId/report/
 * Contrato sugerido: { filename?, score, critical|critical_count, warnings|warning_count }.
 * Si el endpoint aún no existe (404), FileReport usa fallback desde auditStorage (análisis local).
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {Promise<object>}
 */
export const getFileReport = (_projectId, fileId) =>
  request(`/api/audit/${fileId}/report/`);

/**
 * Listado de hallazgos WCAG del archivo para la vista de detalle.
 *
 * Backend esperado: GET /api/audit/:fileId/findings/
 * Respuesta: array de hallazgos o { results: [...] } (DRF paginado).
 * El motor backend debe incluir reglas HU-3.2 (html sin lang, img sin alt) cuando corresponda.
 * Si el endpoint aún no existe (404), ErrorDetail usa fallback desde auditStorage.
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {Promise<Array<object>>}
 */
export const getFileFindings = async (_projectId, fileId) => {
  const data = await request(`/api/audit/${fileId}/findings/`);
  return Array.isArray(data) ? data : (data?.results ?? []);
};
