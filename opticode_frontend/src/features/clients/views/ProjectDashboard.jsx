import { Link, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import ScoreBadge from '../components/ScoreBadge';

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
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Portal Educativo</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fw-bold fs-4 mb-1" style={{ color: 'var(--oc-navy)' }}>
            Portal Educativo
            <span className="badge bg-light text-secondary fw-normal ms-2" style={{ fontSize: '0.75rem' }}>
              {MOCK_FILES.length} Archivos
            </span>
          </h1>
          <p className="text-secondary small mb-0">Repositorio del frontend de la nueva plataforma escolar.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => navigate(`/projects/${projectId}/upload`)}
        >
          <AddIcon style={{ fontSize: '1.125rem' }} />
          Subir Archivos
        </button>
      </div>

      {/* Files Table */}
      <div className="card overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Archivo</th>
              <th>Última Modificación</th>
              <th className="text-center">Críticas</th>
              <th className="text-center">Advertencias</th>
              <th className="text-center">Puntaje Global</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FILES.map((file) => (
              <tr
                key={file.id}
                onClick={() => navigate(`/projects/${projectId}/files/${file.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td className="fw-medium" style={{ color: 'var(--oc-royal)' }}>{file.name}</td>
                <td className="text-secondary">{file.date}</td>
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
                  <div className="d-flex justify-content-center">
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
