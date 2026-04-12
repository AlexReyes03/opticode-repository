import { useState, useEffect, useCallback } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { getProjects } from '../../../api/project-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';

const UserDashboard = () => {
  const [showModal, setShowModal] = useState(false);
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

  const primaryCtaLabel = loading ? 'Cargando…' : projects.length === 0 ? 'Crear primer proyecto' : 'Nuevo proyecto';

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
              onClick={() => setShowModal(true)}
            >
              {!loading && <AddIcon style={{ fontSize: '1.25rem' }} aria-hidden />}
              {loading && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              )}
              {primaryCtaLabel}
            </button>
          </div>
        </div>
      </header>

      <div className="oc-dashboard-card overflow-hidden">
        <div className="card-body mb-3">
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando proyectos</span>
              </div>
              <p className="text-secondary small mb-0">Cargando tus proyectos…</p>
            </div>
          ) : projects.length === 0 ? (
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
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xxl-3 g-3 g-md-4">
              {projects.map((project) => (
                <div className="col" key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={refreshProjects}
      />
    </section>
  );
};

export default UserDashboard;
