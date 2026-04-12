import request from './fetch-wrapper';

/** Límites alineados con el modelo / UX (nombre en BD: max 100). */
export const PROJECT_NAME_MAX_LENGTH = 100;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 500;

/**
 * Servicios de proyectos. Alineado con el modelo backend Project (name, description, owner,
 * created_at, updated_at). El borrado lógico requiere que el backend exponga is_active
 * o un endpoint de desactivación.
 *
 * Endpoints esperados:
 *   GET    /api/projects/              — lista (posible paginación: response.results o array).
 *   POST   /api/projects/              — crear.
 *   GET    /api/projects/:id/          — detalle.
 *   PATCH  /api/projects/:id/          — actualización parcial y/o desactivar (is_active: false).
 *   GET    /api/projects/:id/files/         — archivos del proyecto.
 *   DELETE /api/projects/:id/files/:fileId/ — eliminar un archivo del proyecto.
 */

/**
 * @param {string|undefined|null} iso
 */
function formatProjectDate(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return '—';
  }
}

/**
 * Adapta la respuesta DRF al shape que usa `ProjectCard` (camelCase).
 *
 * @param {object} raw
 */
function normalizeProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const created = raw.created_at ?? raw.updated_at;
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    fileCount: raw.file_count ?? 0,
    date: formatProjectDate(created),
  };
}

/**
 * Lista de proyectos del usuario autenticado.
 *
 * @returns {Promise<Array<object>>} Lista normalizada para la UI.
 */
export const getProjects = async () => {
  try {
    const response = await request('/api/projects/');
    const list = Array.isArray(response) ? response : response?.results ?? [];
    if (!Array.isArray(list)) return [];
    return list.map(normalizeProject).filter(Boolean);
  } catch (err) {
    /* Lista vacía o ruta antigua: no tratar como fallo crítico en dashboard */
    if (err && typeof err === 'object' && err.status === 404) return [];
    throw err;
  }
};

/**
 * Crea un proyecto. Campos según modelo: name, description (opcional).
 *
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<object>} Proyecto creado (id, name, description, owner, created_at, updated_at, …).
 */
export const createProject = (data) =>
  request('/api/projects/', { method: 'POST', body: data });

/**
 * Obtiene un proyecto por id.
 *
 * @param {string|number} projectId
 * @returns {Promise<object>}
 */
export const getProjectById = (projectId) =>
  request(`/api/projects/${projectId}/`);

/**
 * Fila de tabla de archivos en `ProjectDashboard` (camelCase).
 *
 * @param {object} raw
 */
function normalizeUploadedFileRow(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const score = raw.score;
  const scoreNum = score != null && !Number.isNaN(Number(score)) ? Math.round(Number(score)) : null;
  return {
    id: raw.id,
    name: raw.filename ?? '',
    fileType: raw.file_type ?? '',
    date: formatProjectDate(raw.updated_at),
    critical: typeof raw.critical_count === 'number' ? raw.critical_count : 0,
    warnings: typeof raw.warning_count === 'number' ? raw.warning_count : 0,
    improvements: typeof raw.improvement_count === 'number' ? raw.improvement_count : 0,
    score: scoreNum,
  };
}

/**
 * Lista de archivos del proyecto (solo del usuario propietario vía backend).
 *
 * @param {string|number} projectId
 * @returns {Promise<Array<object>>} Filas normalizadas; lista vacía si no hay archivos o 404 legado.
 */
export const getProjectFiles = async (projectId) => {
  try {
    const response = await request(`/api/projects/${projectId}/files/`);
    const list = Array.isArray(response) ? response : response?.results ?? [];
    if (!Array.isArray(list)) return [];
    return list.map(normalizeUploadedFileRow).filter(Boolean);
  } catch (err) {
    if (err && typeof err === 'object' && err.status === 404) return [];
    throw err;
  }
};

/**
 * Elimina un archivo subido del proyecto (no confundir con subir otro con el mismo nombre, que lo reemplaza).
 *
 * @param {string|number} projectId
 * @param {string|number} fileId
 * @returns {Promise<unknown>}
 */
export const deleteProjectFile = (projectId, fileId) =>
  request(`/api/projects/${projectId}/files/${fileId}/`, { method: 'DELETE' });

/**
 * Actualización parcial del proyecto (name, description, etc.).
 *
 * @param {string|number} projectId
 * @param {Partial<{ name: string, description: string }>} data
 * @returns {Promise<object>}
 */
export const updateProject = (projectId, data) =>
  request(`/api/projects/${projectId}/`, { method: 'PATCH', body: data });

/**
 * Elimina el proyecto de forma permanente (cascada en archivos asociados según el modelo).
 *
 * @param {string|number} projectId
 * @returns {Promise<unknown>}
 */
export const deleteProject = (projectId) =>
  request(`/api/projects/${projectId}/`, { method: 'DELETE' });

/**
 * Desactiva el proyecto (borrado lógico). Requiere en el backend un campo is_active
 * o un endpoint que interprete PATCH con is_active: false.
 *
 * @param {string|number} projectId
 * @returns {Promise<object>}
 */
export const deactivateProject = (projectId) =>
  request(`/api/projects/${projectId}/`, { method: 'PATCH', body: { is_active: false } });
