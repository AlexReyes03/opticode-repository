import { Link, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import ScoreBadge from '../components/ScoreBadge';
import './ProjectDashboard.css';

const MOCK_FILES = [
  { id: 1, name: 'header.html', date: 'Hace 2 horas', critical: 0, warnings: 1, score: 95 },
  { id: 2, name: 'index.html', date: 'Ayer, 14:30', critical: 2, warnings: 1, score: 75 },
  { id: 3, name: 'form_contacto.html', date: '10 Mar 2026', critical: 5, warnings: 3, score: 35 },
  { id: 4, name: 'styles.css', date: '09 Mar 2026', critical: 0, warnings: 0, score: 100 },
  { id: 5, name: 'about.html', date: '08 Mar 2026', critical: 1, warnings: 2, score: 80 },
];

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <section>
      {/* Breadcrumb */}
      <div className="oc-breadcrumb">
        <Link to="/dashboard">Mis Proyectos</Link>
        <NavigateNextIcon style={{ fontSize: '1rem' }} />
        <span className="active">Portal Educativo</span>
      </div>

      {/* Header */}
      <div className="project-dashboard__header">
        <div>
          <h1 className="project-dashboard__title">
            Portal Educativo
            <span className="project-dashboard__count">{MOCK_FILES.length} Archivos</span>
          </h1>
          <p className="project-dashboard__desc">Repositorio del frontend de la nueva plataforma escolar.</p>
        </div>
        <button
          type="button"
          className="oc-btn oc-btn-primary"
          onClick={() => navigate(`/projects/${projectId}/upload`)}
        >
          <AddIcon style={{ fontSize: '1.125rem' }} />
          Subir Archivos
        </button>
      </div>

      {/* Files Table */}
      <div className="oc-card" style={{ overflow: 'hidden' }}>
        <table className="project-dashboard__table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Última Modificación</th>
              <th style={{ textAlign: 'center' }}>Críticas</th>
              <th style={{ textAlign: 'center' }}>Advertencias</th>
              <th style={{ textAlign: 'center' }}>Puntaje Global</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FILES.map((file) => (
              <tr
                key={file.id}
                onClick={() => navigate(`/projects/${projectId}/files/${file.id}`)}
              >
                <td className="project-dashboard__filename">{file.name}</td>
                <td className="project-dashboard__date">{file.date}</td>
                <td style={{ textAlign: 'center' }}>
                  {file.critical > 0 ? (
                    <span style={{ color: 'var(--oc-danger)', fontWeight: 700 }}>{file.critical}</span>
                  ) : (
                    <span style={{ color: 'var(--oc-gray-400)' }}>0</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {file.warnings > 0 ? (
                    <span style={{ color: 'var(--oc-warning)', fontWeight: 500 }}>{file.warnings}</span>
                  ) : (
                    <span style={{ color: 'var(--oc-gray-400)' }}>0</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ScoreBadge score={file.score} size="lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProjectDashboard;
