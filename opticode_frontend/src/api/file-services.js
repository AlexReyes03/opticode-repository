import request from './fetch-wrapper';

/**
 * Subida de un archivo HTML o CSS a un proyecto.
 * Backend: POST /api/projects/:projectId/files/upload/ (multipart, campo `file`).
 *
 * @param {string|number} projectId
 * @param {File} file
 * @returns {Promise<{ id: number, filename: string, file_type: string, size_bytes: number }>}
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
 * @param {string|number} projectId
 * @param {File} file
 * @returns {Promise<{ uploaded: Array<object>, ignored: Array<{ filename: string, reason: string }> }>}
 */
export const uploadZip = (projectId, file) =>
  request(`/api/projects/${projectId}/files/upload-zip/`, {
    method: 'POST',
    files: [{ field: 'file', file }],
  });

/**
 * Reporte agregado del archivo (nombre, puntuación, conteos por severidad, etc.).
 *
 * TODO: No hay vista/serializador ni ruta en el backend aún (`features.audit.urls` está vacío).
 * Cuando exista, algo como: GET /api/projects/:projectId/files/:fileId/report/ o bajo /api/audit/...
 * y devolver campos alineados con `FileReport.jsx` (reemplazar `mockData`).
 *
 * @param {string|number} _projectId
 * @param {string|number} _fileId
 * @returns {Promise<object>}
 */
export const getFileReport = async (_projectId, _fileId) => {
  throw new Error(
    '[TODO] getFileReport: falta endpoint en backend (reporte por UploadedFile: score, conteos, nombre).'
  );
};

/**
 * Listado de hallazgos WCAG del archivo para la vista de detalle.
 *
 * TODO: No hay endpoint en backend. Modelo `Finding` existe (severity, wcag_rule, message,
 * line_number, code_snippet, affected_element) pero hace falta API de lectura y mapeo al shape
 * de `ErrorCard` (severity critical|warning, level, title, description, line, codeLines[]).
 *
 * @param {string|number} _projectId
 * @param {string|number} _fileId
 * @returns {Promise<Array<object>>}
 */
export const getFileFindings = async (_projectId, _fileId) => {
  throw new Error(
    '[TODO] getFileFindings: falta endpoint en backend (findings por archivo / audit_result).'
  );
};
