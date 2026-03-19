import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { getProjects } from '../../../api/project-services';

const UserDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Mis Proyectos</h1>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <AddIcon style={{ fontSize: '1.125rem' }} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
  <div className="col-12 text-center text-muted py-5">
    <p>Aún no tienes proyectos. Crea uno primero!</p>
  </div>
        ) : (
          projects.map((project) => (
            <div className="col" key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))
        )}
      </div>

      <CreateProjectModal show={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
};

export default UserDashboard;
