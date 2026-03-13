import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import './UserDashboard.css';

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
    <section className="user-dashboard">
      <div className="user-dashboard__header">
        <h1 className="user-dashboard__title">Mis Proyectos</h1>
        <button
          type="button"
          className="oc-btn oc-btn-primary"
          onClick={() => setShowModal(true)}
        >
          <AddIcon style={{ fontSize: '1.125rem' }} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="user-dashboard__grid">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <CreateProjectModal show={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
};

export default UserDashboard;
