import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Portal Educativo',
    description: 'Repositorio del frontend de la nueva plataforma escolar con enfoque en accesibilidad.',
    fileCount: 12,
    date: '10 Mar 2026',
  },
  {
    id: 2,
    name: 'Landing Corporativa',
    description: 'Sitio web promocional para la empresa, con formularios de contacto y blog integrado.',
    fileCount: 8,
    date: '08 Mar 2026',
  },
  {
    id: 3,
    name: 'E-Commerce MVP',
    description: 'Prototipo de tienda en línea con catálogo de productos y carrito de compras.',
    fileCount: 5,
    date: '05 Mar 2026',
  },
];

const UserDashboard = () => {
  const [showModal, setShowModal] = useState(false);

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
        {MOCK_PROJECTS.map((project) => (
          <div className="col" key={project.id}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      <CreateProjectModal show={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
};

export default UserDashboard;
