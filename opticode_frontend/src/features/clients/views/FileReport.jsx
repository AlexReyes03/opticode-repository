import { Link, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ScoreDonutChart from '../components/ScoreDonutChart';
import './FileReport.css';

const FileReport = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();

  const mockData = { name: 'index.html', score: 75, critical: 2, warnings: 1 };

  return (
    <section>
      {/* Breadcrumb */}
      <div className="oc-breadcrumb">
        <Link to="/dashboard">Mis Proyectos</Link>
        <NavigateNextIcon style={{ fontSize: '1rem' }} />
        <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
        <NavigateNextIcon style={{ fontSize: '1rem' }} />
        <span className="active">{mockData.name}</span>
      </div>

      {/* Disclaimer */}
      <div className="file-report__disclaimer">
        <span className="file-report__disclaimer-icon">i</span>
        <p>
          <strong>Este es un análisis estático.</strong> Para garantizar la accesibilidad completa, realice pruebas manuales
          complementarias utilizando teclado y lectores de pantalla en su sitio renderizado en vivo.
        </p>
      </div>

      {/* Score + Counts Grid */}
      <div className="file-report__grid">
        {/* Donut */}
        <div className="oc-card file-report__score-card">
          <h3 className="file-report__score-label">Puntuación Final</h3>
          <ScoreDonutChart score={mockData.score} />
        </div>

        {/* Counts */}
        <div className="file-report__counts">
          <div className="file-report__count-card file-report__count-card--critical">
            <div className="file-report__count-icon file-report__count-icon--critical">
              <CloseOutlinedIcon style={{ fontSize: '1.25rem' }} />
            </div>
            <div>
              <div className="file-report__count-number file-report__count-number--critical">{mockData.critical}</div>
              <div className="file-report__count-label file-report__count-label--critical">Faltas Críticas (Nivel A)</div>
            </div>
          </div>

          <div className="file-report__count-card file-report__count-card--warning">
            <div className="file-report__count-icon file-report__count-icon--warning">
              <WarningAmberOutlinedIcon style={{ fontSize: '1.25rem' }} />
            </div>
            <div>
              <div className="file-report__count-number file-report__count-number--warning">{mockData.warnings}</div>
              <div className="file-report__count-label file-report__count-label--warning">Advertencias (Nivel AA)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Link to errors */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          className="oc-btn oc-btn-primary oc-btn-lg"
          onClick={() => navigate(`/projects/${projectId}/files/${fileId}/errors`)}
        >
          Ver Hallazgos Detectados
        </button>
      </div>
    </section>
  );
};

export default FileReport;
