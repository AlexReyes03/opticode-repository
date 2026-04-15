import { useState, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { deleteProject, getProjects } from '../../../api/project-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';
import { notifyError, notifySuccess } from '../../../utils/toast';

const UserDashboard = () => {
  const [projectModal, setProjectModal] = useState({ open: false, editProject: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteTitleId = useId();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshProjects = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    return getProjects()
      .then((data) => {
        setProjects(data);
      })
      .catch((error) => {
        setProjects([]);
        setLoadError(getApiErrorMessage(error, 'No se pudieron cargar los proyectos.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const openCreateModal = () => {
    setProjectModal({ open: true, editProject: null });
  };

  const openEditModal = (proj) => {
    setProjectModal({ open: true, editProject: proj });
  };

  const closeProjectModal = () => {
    setProjectModal({ open: false, editProject: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await refreshProjects();
      notifySuccess('Proyecto eliminado correctamente.');
    } catch (err) {
      setDeleteTarget(null);
      notifyError(getApiErrorMessage(err, 'No se pudo eliminar el proyecto.'));
    }
  };

  let primaryCtaLabel = 'Nuevo proyecto';
  if (loading) {
    primaryCtaLabel = 'Cargando…';
  } else if (projects.length === 0) {
    primaryCtaLabel = 'Crear primer proyecto';
  }

  const deleteModal =
    typeof document !== 'undefined' && deleteTarget
      ? createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              aria-hidden="true"
              onClick={() => setDeleteTarget(null)}
            />
            <dialog className="modal fade show d-block" open aria-labelledby={deleteTitleId}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={deleteTitleId}>
                      Eliminar proyecto
                    </h5>
                    <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDeleteTarget(null)} />
                  </div>
                  <div className="modal-body">
                    ¿Seguro que deseas eliminar el proyecto{' '}
                    <span className="fw-semibold">&quot;{deleteTarget.name}&quot;</span>? Esta acción es irreversible y
                    se perderán los archivos asociados.
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>
                      Cancelar
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                      Eliminar proyecto
                    </button>
                  </div>
                </div>
              </div>
            </dialog>
          </>,
          document.body,
        )
      : null;

  return (
    <section className="oc-dashboard-page">
      <header className="oc-dashboard-hero">
        <div className="row g-3 align-items-start align-items-md-center">
          <div className="col-12 col-lg">
            <h1 className="fw-bold mb-1 mb-md-2" style={{ color: 'var(--oc-navy)', fontSize: 'clamp(1.35rem, 4vw, 1.75rem)' }}>
              Mis Proyectos
            </h1>
            <p className="text-secondary small mb-0" style={{ maxWidth: '36rem', lineHeight: 1.6 }}>
              Organiza tus sitios, sube archivos y ejecuta auditorías de accesibilidad WCAG desde un solo panel.
            </p>
          </div>
          <div className="col-12 col-sm-auto">
            <button
              type="button"
              className="btn btn-primary btn-lg d-inline-flex align-items-center justify-content-center gap-2 w-100 px-4"
              disabled={loading}
              onClick={openCreateModal}
            >
              {!loading && <AddIcon style={{ fontSize: '1.25rem' }} aria-hidden />}
              {loading && <output className="spinner-border spinner-border-sm" aria-live="polite" aria-hidden="true" />}
              {primaryCtaLabel}
            </button>
          </div>
        </div>
      </header>

      <div className="oc-dashboard-card overflow-hidden">
        <div className="card-body">
          {loadError && (
            <div
              className="alert alert-danger d-flex align-items-start gap-2 py-2 small mb-4"
              role="alert"
            >
              <ErrorOutlineIcon className="flex-shrink-0" style={{ fontSize: '1.25rem', marginTop: '0.1rem' }} />
              <span>{loadError}</span>
            </div>
          )}

          {loading ? (
            <div className="oc-dashboard-loading d-flex flex-column align-items-center justify-content-center gap-3 py-4">
              <output className="spinner-border text-primary" aria-live="polite">
                <span className="visually-hidden">Cargando proyectos</span>
              </output>
              <p className="text-secondary small mb-0">Cargando tus proyectos…</p>
            </div>
          ) : (() => {
            if (projects.length === 0) {
              return (
                <div className="text-center py-4 py-md-5 px-2 mx-auto" style={{ maxWidth: '26rem' }}>
                  <div className="oc-dashboard-empty-icon mb-4" aria-hidden>
                    <FolderCopyOutlinedIcon style={{ fontSize: '2.5rem' }} />
                  </div>
                  <h2 className="fs-5 fw-bold mb-2" style={{ color: 'var(--oc-navy)' }}>
                    Aún no hay proyectos
                  </h2>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.65 }}>
                    Usa el botón <span className="fw-semibold" style={{ color: 'var(--oc-navy)' }}>{primaryCtaLabel}</span> arriba
                    para crear tu primer proyecto y comenzar a subir HTML o CSS.
                  </p>
                </div>
              );
            }
            return (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-xxl-3 g-3 g-md-4">
                {projects.map((project) => (
                  <div className="col" key={project.id}>
                    <ProjectCard
                      project={project}
                      onEdit={openEditModal}
                      onDelete={(p) => {
                        setDeleteTarget(p);
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      <CreateProjectModal
        show={projectModal.open}
        projectToEdit={projectModal.editProject}
        onClose={closeProjectModal}
        onProjectCreated={({ mode } = {}) => {
          closeProjectModal();
          refreshProjects();
          if (mode === 'edit') {
            notifySuccess('Proyecto actualizado correctamente.');
          } else {
            notifySuccess('Proyecto creado correctamente.');
          }
        }}
      />
      {deleteModal}
    </section>
  );
};

export default UserDashboard;
