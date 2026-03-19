import request from './fetch-wrapper';

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
 *   GET    /api/projects/:id/files/    — archivos del proyecto.
 */

/**
 * Lista de proyectos del usuario autenticado.
 *
 * @returns {Promise<Array<object>>} Lista de proyectos. Si el backend pagina (DRF), se devuelve response.results.
 */
export const getProjects = async () => {
  const response = await request('/api/projects/');
  return response?.results ?? response ?? [];
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
 * Lista de archivos del proyecto (auditorías/subidas asociadas).
 *
 * @param {string|number} projectId
 * @returns {Promise<Array<object>>} Lista de archivos. Si el backend pagina, se devuelve response.results.
 */
export const getProjectFiles = async (projectId) => {
  const response = await request(`/api/projects/${projectId}/files/`);
  return response?.results ?? response ?? [];
};

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
 * Desactiva el proyecto (borrado lógico). Requiere en el backend un campo is_active
 * o un endpoint que interprete PATCH con is_active: false.
 *
 * @param {string|number} projectId
 * @returns {Promise<object>}
 */
export const deactivateProject = (projectId) =>
  request(`/api/projects/${projectId}/`, { method: 'PATCH', body: { is_active: false } });
