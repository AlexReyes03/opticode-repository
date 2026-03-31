import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ScoreDonutChart from '../components/ScoreDonutChart';
import { loadAuditResult } from '../utils/auditStorage';

/**
 * Reporte de accesibilidad de un archivo analizado.
 *
 * Lee los resultados del análisis WCAG estático generados por htmlSyntaxAnalyzer
 * y almacenados en localStorage por useFileUpload al momento de la subida.
 *
 * TODO(backend): Cuando el endpoint GET /api/audit/<fileId>/report/ esté disponible,
 * reemplazar loadAuditResult() por getFileReport(projectId, fileId) de file-services.js.
 * El shape esperado: { score, criticalCount, warningCount, filename }.
 */
const FileReport = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const result = loadAuditResult(projectId, fileId);
    setReport(result ?? null);
    setIsLoading(false);
  }, [projectId, fileId]);

  const reportScore = Number(report?.score ?? 0);
  const reportCritical = Number(report?.criticalCount ?? 0);
  const reportWarnings = Number(report?.warningCount ?? 0);

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
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {`Archivo ${fileId}`}
          </li>
        </ol>
      </nav>

      {/* Disclaimer */}
      <div className="alert alert-info d-flex gap-2 mb-4">
        <span className="fw-bold fs-5 lh-1" style={{ color: 'var(--oc-royal)' }}>i</span>
        <p className="mb-0 small" style={{ color: '#1e3a5f' }}>
          <strong>Este es un análisis estático.</strong> Para garantizar la accesibilidad completa,
          realice pruebas manuales complementarias utilizando teclado y lectores de pantalla en su
          sitio renderizado en vivo.
        </p>
      </div>

      {isLoading && (
        <div className="alert alert-secondary" role="status">
          Cargando reporte del archivo...
        </div>
      )}

      {!isLoading && !report && (
        <div className="alert alert-warning" role="alert">
          No hay análisis disponible para este archivo.
          <div className="small mt-1">
            Sube el archivo desde la vista de carga para generar el reporte de accesibilidad.
          </div>
        </div>
      )}

      {/* Score + Counts Grid */}
      <div className="row g-4 mb-4" aria-busy={isLoading}>
        {/* Donut */}
        <div className="col-md-4">
          <div className="card h-100 d-flex flex-column align-items-center justify-content-center p-4">
            <h3
              className="text-uppercase small fw-semibold text-secondary mb-3"
              style={{ letterSpacing: '0.05em' }}
            >
              Puntuación Final
            </h3>
            <ScoreDonutChart score={reportScore} />
          </div>
        </div>

        {/* Counts */}
        <div className="col-md-8">
          <div className="row row-cols-1 row-cols-sm-2 g-3 h-100">
            <div className="col">
              <div
                className="card h-100 d-flex flex-row align-items-center gap-3 p-4"
                style={{
                  backgroundColor: 'var(--oc-danger-light)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--oc-danger)',
                  }}
                >
                  <CloseOutlinedIcon style={{ fontSize: '1.25rem' }} />
                </div>
                <div>
                  <div className="fw-bold fs-3" style={{ color: 'var(--oc-danger-dark)' }}>
                    {reportCritical}
                  </div>
                  <div className="fw-medium small" style={{ color: '#7f1d1d' }}>
                    Faltas Críticas (Nivel A)
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div
                className="card h-100 d-flex flex-row align-items-center gap-3 p-4"
                style={{
                  backgroundColor: 'var(--oc-warning-light)',
                  border: '1px solid rgba(249, 115, 22, 0.15)',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    color: 'var(--oc-warning)',
                  }}
                >
                  <WarningAmberOutlinedIcon style={{ fontSize: '1.25rem' }} />
                </div>
                <div>
                  <div className="fw-bold fs-3" style={{ color: 'var(--oc-warning-dark)' }}>
                    {reportWarnings}
                  </div>
                  <div className="fw-medium small" style={{ color: '#7c2d12' }}>
                    Advertencias (Nivel AA)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link to errors */}
      <div className="text-center mt-3">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => navigate(`/projects/${projectId}/files/${fileId}/errors`)}
          disabled={!report}
        >
          Ver Hallazgos Detectados
        </button>
      </div>
    </section>
  );
};

export default FileReport;
