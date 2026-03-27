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
 * TODO(backend): Cuando exista el endpoint de lectura (por ejemplo GET /api/projects/:projectId/files/:fileId/report/):
 * 1. Eliminar el `throw` de abajo.
 * 2. Descomentar y ajustar la ruta al contrato real del backend.
 * 3. Quitar en FileReport.jsx el aviso temporal “TODO: backend debe exponer endpoint...”.
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {Promise<object>}
 */
export const getFileReport = async (_projectId, _fileId) => {
  // return request(`/api/projects/${_projectId}/files/${_fileId}/report/`);
  throw new Error(
    '[TODO backend] getFileReport: falta endpoint (reporte por archivo). Ver JSDoc arriba para activar request().'
  );
};

/**
 * Listado de hallazgos WCAG del archivo para la vista de detalle.
 *
 * TODO(backend): Cuando exista el endpoint (por ejemplo GET /api/projects/:projectId/files/:fileId/findings/):
 * 1. Eliminar el `throw` de abajo.
 * 2. Descomentar y ajustar la ruta y formato (array o { results }).
 * 3. Quitar en ErrorDetail.jsx el aviso temporal “TODO: backend debe exponer endpoint...”.
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {Promise<Array<object>>}
 */
export const getFileFindings = async (_projectId, _fileId) => {
  // const data = await request(`/api/projects/${_projectId}/files/${_fileId}/findings/`);
  // return Array.isArray(data) ? data : (data?.results ?? []);
  throw new Error(
    '[TODO backend] getFileFindings: falta endpoint (hallazgos por archivo). Ver JSDoc arriba para activar request().'
  );
};
