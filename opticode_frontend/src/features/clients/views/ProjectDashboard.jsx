import { useCallback, useEffect, useLayoutEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScoreBadge from '../components/ScoreBadge';
import {
  deleteProjectFile,
  getProjectById,
  getProjectFiles,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  updateProject,
} from '../../../api/project-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';
import { notifyError, notifySuccess } from '../../../utils/toast';

function resizeDescriptionField(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
}

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [fileDeleteTarget, setFileDeleteTarget] = useState(null);
  const [fileDeleting, setFileDeleting] = useState(false);
  const fileDeleteTitleId = useId();

  const nameInputRef = useRef(null);
  const descInputRef = useRef(null);

  const loadData = useCallback(() => {
    if (projectId == null || projectId === '') {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }

    setLoadError(null);
    setNotFound(false);
    setLoading(true);
    setEditing(null);

    const id = projectId;
    return getProjectById(id)
      .then((proj) => {
        if (proj && typeof proj === 'object') {
          setProject({
            id: proj.id,
            name: (proj.name ?? 'Proyecto').slice(0, PROJECT_NAME_MAX_LENGTH),
            description: (proj.description ?? '').slice(0, PROJECT_DESCRIPTION_MAX_LENGTH),
          });
        } else {
          setProject(null);
        }
        return getProjectFiles(id);
      })
      .then((fileList) => {
        setFiles(Array.isArray(fileList) ? fileList : []);
      })
      .catch((err) => {
        if (err && typeof err === 'object' && err.status === 404) {
          setNotFound(true);
          setProject(null);
          setFiles([]);
          return;
        }
        setLoadError(getApiErrorMessage(err, 'No se pudo cargar el proyecto o los archivos.'));
        setFiles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (project && editing === null) {
      setDraftName(project.name ?? '');
      setDraftDesc(project.description ?? '');
    }
  }, [project, editing]);

  const beginEditName = useCallback(() => {
    if (!project || loading) return;
    const n = (project.name ?? '').slice(0, PROJECT_NAME_MAX_LENGTH);
    setDraftName(n);
    setEditing('name');
    queueMicrotask(() => nameInputRef.current?.focus());
  }, [project, loading]);

  const beginEditDescription = useCallback(() => {
    if (!project || loading) return;
    const d = (project.description ?? '').slice(0, PROJECT_DESCRIPTION_MAX_LENGTH);
    setDraftDesc(d);
    setEditing('description');
    queueMicrotask(() => {
      const el = descInputRef.current;
      el?.focus();
      resizeDescriptionField(el);
    });
  }, [project, loading]);

  useLayoutEffect(() => {
    if (editing === 'description') {
      resizeDescriptionField(descInputRef.current);
    }
  }, [editing, draftDesc]);

  const commitName = useCallback(async () => {
    if (!project) return;
    setEditing(null);
    const trimmed = draftName.trim().slice(0, PROJECT_NAME_MAX_LENGTH);
    const current = (project.name ?? '').trim();
    if (trimmed === current) return;
    if (!trimmed) {
      setDraftName(project.name ?? '');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProject(project.id, { name: trimmed });
      setProject((p) => ({
        ...p,
        name: updated?.name ?? trimmed,
        description: updated?.description ?? p.description,
      }));
      notifySuccess('Nombre del proyecto actualizado.');
    } catch (err) {
      notifyError(getApiErrorMessage(err, 'No se pudo actualizar el nombre.'));
      setDraftName(project.name ?? '');
    } finally {
      setSaving(false);
    }
  }, [project, draftName]);

  const commitDescription = useCallback(async () => {
    if (!project) return;
    setEditing(null);
    const next = draftDesc.trim().slice(0, PROJECT_DESCRIPTION_MAX_LENGTH);
    const current = (project.description ?? '').trim();
    if (next === current) return;
    setSaving(true);
    try {
      const updated = await updateProject(project.id, { description: next });
      setProject((p) => ({
        ...p,
        name: updated?.name ?? p.name,
        description: updated?.description ?? next,
      }));
      notifySuccess('Descripción actualizada.');
    } catch (err) {
      notifyError(getApiErrorMessage(err, 'No se pudo actualizar la descripción.'));
      setDraftDesc(project.description ?? '');
    } finally {
      setSaving(false);
    }
  }, [project, draftDesc]);

  const handleConfirmDeleteFile = useCallback(async () => {
    if (!fileDeleteTarget?.id || projectId == null || projectId === '') return;
    setFileDeleting(true);
    try {
      await deleteProjectFile(projectId, fileDeleteTarget.id);
      setFileDeleteTarget(null);
      const reload = loadData();
      if (reload) await reload;
      notifySuccess('Archivo eliminado correctamente.');
    } catch (err) {
      notifyError(getApiErrorMessage(err, 'No se pudo eliminar el archivo.'));
    } finally {
      setFileDeleting(false);
    }
  }, [fileDeleteTarget, projectId, loadData]);

  if (notFound) {
    return <Navigate to="/dashboard" replace />;
  }

  const projectName = project?.name ?? 'Proyecto';
  const projectDescription = project?.description ?? '';
  const breadcrumbLabel = loading ? '…' : editing === 'name' ? draftName.trim() || '…' : projectName;

  const fileDeleteModal =
    typeof document !== 'undefined' && fileDeleteTarget
      ? createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              aria-hidden="true"
              onClick={() => !fileDeleting && setFileDeleteTarget(null)}
            />
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={fileDeleteTitleId}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={fileDeleteTitleId}>
                      Eliminar archivo
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      disabled={fileDeleting}
                      onClick={() => setFileDeleteTarget(null)}
                    >
                    </button>
                  </div>
                  <div className="modal-body">
                    ¿Seguro que deseas eliminar{' '}
                    <span className="fw-semibold">&quot;{fileDeleteTarget.name}&quot;</span> de este proyecto? Esta
                    acción es irreversible. Si más adelante subes otro archivo con el mismo nombre, se creará un
                    registro nuevo (no restaura este).
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={fileDeleting}
                      onClick={() => setFileDeleteTarget(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger d-inline-flex align-items-center gap-2"
                      disabled={fileDeleting}
                      onClick={handleConfirmDeleteFile}
                    >
                      {fileDeleting && (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      )}
                      Eliminar archivo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <section>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item d-flex align-items-center gap-1">
            <NavigateNextIcon style={{ fontSize: '1rem' }} aria-hidden />
            <span className="text-truncate" style={{ maxWidth: '14rem' }} title={breadcrumbLabel}>
              {breadcrumbLabel}
            </span>
          </li>
        </ol>
      </nav>

      <div className="row g-3 align-items-start mb-4">
        <div className="col-12 col-md min-w-0">
          <div className="d-flex flex-column gap-1 mb-1">
            <div className="d-inline-flex flex-wrap align-items-baseline gap-2 max-w-100">
              {editing === 'name' ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  className="oc-project-inline-title min-w-0"
                  size={Math.min(
                    PROJECT_NAME_MAX_LENGTH,
                    Math.max(8, draftName.length + 1),
                  )}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value.slice(0, PROJECT_NAME_MAX_LENGTH))}
                  onBlur={commitName}
                  maxLength={PROJECT_NAME_MAX_LENGTH}
                  aria-label="Nombre del proyecto"
                />
              ) : (
                <h1
                  className="fw-bold fs-4 mb-0 text-break min-w-0"
                  style={{ color: 'var(--oc-navy)', cursor: loading ? 'default' : 'pointer' }}
                  role={loading ? undefined : 'button'}
                  tabIndex={loading ? undefined : 0}
                  title={loading ? undefined : 'Clic para editar'}
                  onClick={loading ? undefined : beginEditName}
                  onKeyDown={
                    loading
                      ? undefined
                      : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            beginEditName();
                          }
                        }
                  }
                >
                  {loading ? 'Cargando…' : projectName}
                </h1>
              )}
              {!loading && editing !== 'name' && (
                <span className="badge bg-light text-secondary fw-normal" style={{ fontSize: '0.75rem' }}>
                  {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
                </span>
              )}
              {saving && (
                <span className="text-secondary small" aria-live="polite">
                  Guardando…
                </span>
              )}
            </div>
            {editing === 'name' && (
              <span className="text-muted align-self-end" style={{ fontSize: '0.7rem' }}>
                {draftName.length}/{PROJECT_NAME_MAX_LENGTH}
              </span>
            )}
          </div>

          <div className="d-flex flex-column gap-1">
            {editing === 'description' ? (
              <>
                <textarea
                  ref={descInputRef}
                  className="oc-project-inline-desc"
                  rows={1}
                  value={draftDesc}
                  placeholder="Añade una descripción"
                  maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH);
                    setDraftDesc(v);
                    resizeDescriptionField(e.target);
                  }}
                  onBlur={commitDescription}
                  aria-label="Descripción del proyecto"
                />
                <span className="text-muted align-self-end" style={{ fontSize: '0.7rem' }}>
                  {draftDesc.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
                </span>
              </>
            ) : (
              <>
                <p
                  className="small mb-0 text-break"
                  style={{ lineHeight: 1.65, cursor: loading ? 'default' : 'pointer' }}
                  role={loading ? undefined : 'button'}
                  tabIndex={loading ? undefined : 0}
                  title={loading ? undefined : 'Clic para editar'}
                  onClick={loading ? undefined : beginEditDescription}
                  onKeyDown={
                    loading
                      ? undefined
                      : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            beginEditDescription();
                          }
                        }
                  }
                >
                  {projectDescription.trim() ? (
                    <span className="text-secondary">{projectDescription}</span>
                  ) : (
                    !loading && <span className="text-secondary fst-italic">Añade una descripción</span>
                  )}
                </p>
                {!loading && (
                  <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                    {projectDescription.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="col-12 col-md-auto d-grid d-md-block">
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 w-100"
            onClick={() => navigate(`/projects/${projectId}/upload`)}
          >
            <AddIcon style={{ fontSize: '1.125rem' }} aria-hidden />
            Subir archivos
          </button>
        </div>
      </div>

      {loadError && (
        <div className="alert alert-danger d-flex align-items-start gap-2 py-2 small mb-4" role="alert">
          <ErrorOutlineIcon className="flex-shrink-0" style={{ fontSize: '1.25rem', marginTop: '0.1rem' }} />
          <span>{loadError}</span>
        </div>
      )}

      <div className="card overflow-hidden border-0 shadow-sm">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando archivos</span>
            </div>
            <p className="text-secondary small mb-0">Cargando archivos del proyecto…</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Archivo</th>
                  <th scope="col">Última modificación</th>
                  <th className="text-center" scope="col">
                    Críticas
                  </th>
                  <th className="text-center" scope="col">
                    Advertencias
                  </th>
                  <th className="text-center" scope="col">
                    Mejoras
                  </th>
                  <th className="text-center" scope="col">
                    Puntaje global
                  </th>
                  <th className="text-end" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-5">
                      No hay archivos subidos. Usa &quot;Subir archivos&quot; para añadir HTML o CSS.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => navigate(`/projects/${projectId}/files/${file.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="fw-medium text-break p-0" style={{ color: 'var(--oc-royal)' }}>
                        <Link
                          className="d-block px-3 py-2 text-decoration-none text-break"
                          style={{ color: 'var(--oc-royal)' }}
                          to={`/projects/${projectId}/files/${file.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {file.name}
                          {file.fileType ? (
                            <span className="text-secondary fw-normal small ms-1">({file.fileType})</span>
                          ) : null}
                        </Link>
                      </td>
                      <td className="text-secondary text-nowrap">{file.date}</td>
                      <td className="text-center">
                        {file.critical > 0 ? (
                          <span className="fw-bold text-danger">{file.critical}</span>
                        ) : (
                          <span className="text-secondary">0</span>
                        )}
                      </td>
                      <td className="text-center">
                        {file.warnings > 0 ? (
                          <span className="fw-medium text-warning">{file.warnings}</span>
                        ) : (
                          <span className="text-secondary">0</span>
                        )}
                      </td>
                      <td className="text-center">
                        {file.improvements > 0 ? (
                          <span className="fw-medium" style={{ color: 'var(--oc-royal)' }}>{file.improvements}</span>
                        ) : (
                          <span className="text-secondary">0</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center">
                          {file.score === null ? (
                            <span className="text-secondary small">—</span>
                          ) : (
                            <ScoreBadge score={file.score} size="lg" />
                          )}
                        </div>
                      </td>
                      <td
                        className="text-end align-middle"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                          aria-label={`Eliminar archivo ${file.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileDeleteTarget({ id: file.id, name: file.name });
                          }}
                        >
                          <DeleteOutlineIcon style={{ fontSize: '1.125rem' }} aria-hidden />
                          <span className="d-none d-md-inline">Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {fileDeleteModal}
    </section>
  );
};

export default ProjectDashboard;
