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

function buildProjectFromApi(proj) {
  if (!proj || typeof proj !== 'object') return null;
  return {
    id: proj.id,
    name: (proj.name ?? 'Proyecto').slice(0, PROJECT_NAME_MAX_LENGTH),
    description: (proj.description ?? '').slice(0, PROJECT_DESCRIPTION_MAX_LENGTH),
  };
}

function keyboardActivateEdit(handler) {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}

function getBreadcrumbLabel(loading, editing, draftName, projectName) {
  if (loading) return '…';
  if (editing === 'name') return draftName.trim() || '…';
  return projectName;
}

function DeleteFileModal({ target, fileDeleting, titleId, onClose, onConfirm }) {
  if (typeof document === 'undefined' || !target) return null;

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        aria-hidden="true"
        onClick={() => !fileDeleting && onClose()}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={titleId}>
                Eliminar archivo
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                disabled={fileDeleting}
                onClick={onClose}
              >
              </button>
            </div>
            <div className="modal-body">
              ¿Seguro que deseas eliminar{' '}
              <span className="fw-semibold">&quot;{target.name}&quot;</span> de este proyecto? Esta acción es
              irreversible. Si más adelante subes otro archivo con el mismo nombre, se creará un registro nuevo (no
              restaura este).
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={fileDeleting}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger d-inline-flex align-items-center gap-2"
                disabled={fileDeleting}
                onClick={onConfirm}
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
  );
}

function ProjectNameInlineInput({
  draftName,
  nameInputRef,
  onDraftNameChange,
  onCommitName,
}) {
  return (
    <input
      ref={nameInputRef}
      type="text"
      className="oc-project-inline-title min-w-0"
      size={Math.min(PROJECT_NAME_MAX_LENGTH, Math.max(8, draftName.length + 1))}
      value={draftName}
      onChange={onDraftNameChange}
      onBlur={onCommitName}
      maxLength={PROJECT_NAME_MAX_LENGTH}
      aria-label="Nombre del proyecto"
    />
  );
}

function ProjectNameHeading({ loading, projectName, onBeginEditName }) {
  const titleInteractive = !loading;
  const titleKeyHandler = titleInteractive ? keyboardActivateEdit(onBeginEditName) : undefined;

  return (
    <h1
      className="fw-bold fs-4 mb-0 text-break min-w-0"
      style={{ color: 'var(--oc-navy)', cursor: loading ? 'default' : 'pointer' }}
      role={titleInteractive ? 'button' : undefined}
      tabIndex={titleInteractive ? 0 : undefined}
      title={titleInteractive ? 'Clic para editar' : undefined}
      onClick={titleInteractive ? onBeginEditName : undefined}
      onKeyDown={titleKeyHandler}
    >
      {loading ? 'Cargando…' : projectName}
    </h1>
  );
}

function ProjectTitleBlock({
  loading,
  editing,
  draftName,
  projectName,
  fileCount,
  saving,
  nameInputRef,
  onDraftNameChange,
  onCommitName,
  onBeginEditName,
}) {
  const showFileBadge = !loading && editing !== 'name';

  return (
    <div className="d-flex flex-column gap-1 mb-1">
      <div className="d-inline-flex flex-wrap align-items-baseline gap-2 max-w-100">
        {editing === 'name' ? (
          <ProjectNameInlineInput
            draftName={draftName}
            nameInputRef={nameInputRef}
            onDraftNameChange={onDraftNameChange}
            onCommitName={onCommitName}
          />
        ) : (
          <ProjectNameHeading loading={loading} projectName={projectName} onBeginEditName={onBeginEditName} />
        )}
        {showFileBadge && (
          <span className="badge bg-light text-secondary fw-normal" style={{ fontSize: '0.75rem' }}>
            {fileCount} {fileCount === 1 ? 'archivo' : 'archivos'}
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
  );
}

function ProjectDescriptionBlock({
  loading,
  editing,
  draftDesc,
  projectDescription,
  descInputRef,
  onDraftDescChange,
  onCommitDescription,
  onBeginEditDescription,
}) {
  const descInteractive = !loading;
  const descKeyHandler = descInteractive ? keyboardActivateEdit(onBeginEditDescription) : undefined;
  const trimmedDesc = projectDescription.trim();
  const showPlaceholder = !trimmedDesc && !loading;

  if (editing === 'description') {
    return (
      <div className="d-flex flex-column gap-1">
        <textarea
          ref={descInputRef}
          className="oc-project-inline-desc"
          rows={1}
          value={draftDesc}
          placeholder="Añade una descripción"
          maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
          onChange={onDraftDescChange}
          onBlur={onCommitDescription}
          aria-label="Descripción del proyecto"
        />
        <span className="text-muted align-self-end" style={{ fontSize: '0.7rem' }}>
          {draftDesc.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
        </span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-1">
      <p
        className="small mb-0 text-break"
        style={{ lineHeight: 1.65, cursor: loading ? 'default' : 'pointer' }}
        role={descInteractive ? 'button' : undefined}
        tabIndex={descInteractive ? 0 : undefined}
        title={descInteractive ? 'Clic para editar' : undefined}
        onClick={descInteractive ? onBeginEditDescription : undefined}
        onKeyDown={descKeyHandler}
      >
        {trimmedDesc ? (
          <span className="text-secondary">{projectDescription}</span>
        ) : (
          showPlaceholder && <span className="text-secondary fst-italic">Añade una descripción</span>
        )}
      </p>
      {!loading && (
        <span className="text-muted" style={{ fontSize: '0.65rem' }}>
          {projectDescription.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
        </span>
      )}
    </div>
  );
}

function FileRowCriticalCell({ value }) {
  if (value > 0) {
    return (
      <td className="text-center">
        <span className="fw-bold text-danger">{value}</span>
      </td>
    );
  }
  return (
    <td className="text-center">
      <span className="text-secondary">0</span>
    </td>
  );
}

function FileRowWarningsCell({ value }) {
  if (value > 0) {
    return (
      <td className="text-center">
        <span className="fw-medium text-warning">{value}</span>
      </td>
    );
  }
  return (
    <td className="text-center">
      <span className="text-secondary">0</span>
    </td>
  );
}

function FileRowImprovementsCell({ value }) {
  if (value > 0) {
    return (
      <td className="text-center">
        <span className="fw-medium" style={{ color: 'var(--oc-royal)' }}>{value}</span>
      </td>
    );
  }
  return (
    <td className="text-center">
      <span className="text-secondary">0</span>
    </td>
  );
}

function FileRowScoreCell({ score }) {
  return (
    <td className="text-center">
      <div className="d-flex justify-content-center">
        {score === null ? (
          <span className="text-secondary small">—</span>
        ) : (
          <ScoreBadge score={score} size="lg" />
        )}
      </div>
    </td>
  );
}

function ProjectFileRow({ file, projectId, navigate, onRequestDelete }) {
  const rowClick = () => navigate(`/projects/${projectId}/files/${file.id}`);
  const stop = (e) => e.stopPropagation();

  return (
    <tr onClick={rowClick} style={{ cursor: 'pointer' }}>
      <td className="fw-medium text-break p-0" style={{ color: 'var(--oc-royal)' }}>
        <Link
          className="d-block px-3 py-2 text-decoration-none text-break"
          style={{ color: 'var(--oc-royal)' }}
          to={`/projects/${projectId}/files/${file.id}`}
          onClick={stop}
        >
          {file.name}
          {file.fileType ? (
            <span className="text-secondary fw-normal small ms-1">({file.fileType})</span>
          ) : null}
        </Link>
      </td>
      <td className="text-secondary text-nowrap">{file.date}</td>
      <FileRowCriticalCell value={file.critical} />
      <FileRowWarningsCell value={file.warnings} />
      <FileRowImprovementsCell value={file.improvements} />
      <FileRowScoreCell score={file.score} />
      <td className="text-end align-middle" onClick={stop} onKeyDown={stop}>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
          aria-label={`Eliminar archivo ${file.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete({ id: file.id, name: file.name });
          }}
        >
          <DeleteOutlineIcon style={{ fontSize: '1.125rem' }} aria-hidden />
          <span className="d-none d-md-inline">Eliminar</span>
        </button>
      </td>
    </tr>
  );
}

function ProjectFilesTable({ loading, files, projectId, navigate, onRequestDelete }) {
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando archivos</span>
        </div>
        <p className="text-secondary small mb-0">Cargando archivos del proyecto…</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
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
            <tr>
              <td colSpan={7} className="text-center text-secondary py-5">
                No hay archivos subidos. Usa &quot;Subir archivos&quot; para añadir HTML o CSS.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
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
          {files.map((file) => (
            <ProjectFileRow
              key={file.id}
              file={file}
              projectId={projectId}
              navigate={navigate}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useProjectDashboard(projectId) {
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
    return (async () => {
      try {
        const proj = await getProjectById(id);
        setProject(buildProjectFromApi(proj));
        const fileList = await getProjectFiles(id);
        setFiles(Array.isArray(fileList) ? fileList : []);
      } catch (err) {
        if (err && typeof err === 'object' && err.status === 404) {
          setNotFound(true);
          setProject(null);
          setFiles([]);
          return;
        }
        setLoadError(getApiErrorMessage(err, 'No se pudo cargar el proyecto o los archivos.'));
        setFiles([]);
      } finally {
        setLoading(false);
      }
    })();
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
      if (reload !== undefined) await reload;
      notifySuccess('Archivo eliminado correctamente.');
    } catch (err) {
      notifyError(getApiErrorMessage(err, 'No se pudo eliminar el archivo.'));
    } finally {
      setFileDeleting(false);
    }
  }, [fileDeleteTarget, projectId, loadData]);

  const onDraftNameChange = useCallback((e) => {
    setDraftName(e.target.value.slice(0, PROJECT_NAME_MAX_LENGTH));
  }, []);

  const onDraftDescChange = useCallback((e) => {
    const v = e.target.value.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH);
    setDraftDesc(v);
    resizeDescriptionField(e.target);
  }, []);

  return {
    navigate,
    project,
    files,
    loading,
    loadError,
    notFound,
    editing,
    draftName,
    draftDesc,
    saving,
    fileDeleteTarget,
    fileDeleting,
    fileDeleteTitleId,
    nameInputRef,
    descInputRef,
    beginEditName,
    beginEditDescription,
    commitName,
    commitDescription,
    handleConfirmDeleteFile,
    setFileDeleteTarget,
    onDraftNameChange,
    onDraftDescChange,
  };
}

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const {
    navigate,
    project,
    files,
    loading,
    loadError,
    notFound,
    editing,
    draftName,
    draftDesc,
    saving,
    fileDeleteTarget,
    fileDeleting,
    fileDeleteTitleId,
    nameInputRef,
    descInputRef,
    beginEditName,
    beginEditDescription,
    commitName,
    commitDescription,
    handleConfirmDeleteFile,
    setFileDeleteTarget,
    onDraftNameChange,
    onDraftDescChange,
  } = useProjectDashboard(projectId);

  if (notFound) {
    return <Navigate to="/dashboard" replace />;
  }

  const projectName = project?.name ?? 'Proyecto';
  const projectDescription = project?.description ?? '';
  const breadcrumbLabel = getBreadcrumbLabel(loading, editing, draftName, projectName);

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
          <ProjectTitleBlock
            loading={loading}
            editing={editing}
            draftName={draftName}
            projectName={projectName}
            fileCount={files.length}
            saving={saving}
            nameInputRef={nameInputRef}
            onDraftNameChange={onDraftNameChange}
            onCommitName={commitName}
            onBeginEditName={beginEditName}
          />

          <ProjectDescriptionBlock
            loading={loading}
            editing={editing}
            draftDesc={draftDesc}
            projectDescription={projectDescription}
            descInputRef={descInputRef}
            onDraftDescChange={onDraftDescChange}
            onCommitDescription={commitDescription}
            onBeginEditDescription={beginEditDescription}
          />
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
        <ProjectFilesTable
          loading={loading}
          files={files}
          projectId={projectId}
          navigate={navigate}
          onRequestDelete={setFileDeleteTarget}
        />
      </div>

      <DeleteFileModal
        target={fileDeleteTarget}
        fileDeleting={fileDeleting}
        titleId={fileDeleteTitleId}
        onClose={() => setFileDeleteTarget(null)}
        onConfirm={handleConfirmDeleteFile}
      />
    </section>
  );
};

export default ProjectDashboard;
