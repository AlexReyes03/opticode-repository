import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorCard from '../components/ErrorCard';
import ErrorFilter from '../components/ErrorFilter';
import { getFileFindings } from '../../../api/file-services';

const normalizeCodeLines = (finding) => {
  if (Array.isArray(finding?.codeLines)) return finding.codeLines;
  if (!finding?.code_snippet) return [];

  return String(finding.code_snippet)
    .split('\n')
    .map((content, index) => ({
      lineNumber: Number(finding.line ?? finding.line_number ?? 0) + index,
      content,
    }));
};

const normalizeFinding = (finding, index) => {
  const severity = finding?.severity === 'error' ? 'critical' : (finding?.severity ?? 'warning');
  return {
    id: finding?.id ?? `${finding?.wcag_rule ?? 'finding'}-${index}`,
    severity,
    level: finding?.level ?? (severity === 'critical' ? 'Nivel A' : 'Nivel AA'),
    title: finding?.title ?? finding?.wcag_rule ?? 'Hallazgo WCAG',
    description: finding?.description ?? finding?.message ?? 'Sin descripción disponible.',
    line: Number(finding?.line ?? finding?.line_number ?? 0),
    codeLines: normalizeCodeLines(finding),
  };
};

const ErrorDetail = () => {
  const { projectId, fileId } = useParams();
  const [filter, setFilter] = useState('all');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadFindings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getFileFindings(projectId, fileId);
        if (!mounted) return;
        const findings = Array.isArray(response) ? response : (response?.results ?? []);
        setErrors(findings.map(normalizeFinding));
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error?.message ?? 'No fue posible cargar los hallazgos del archivo.');
        setErrors([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadFindings();
    return () => {
      mounted = false;
    };
  }, [projectId, fileId]);

  const filteredErrors = errors.filter((err) => {
    if (filter === 'all') return true;
    return err.severity === filter;
  });

  const counts = {
    all: errors.length,
    critical: errors.filter((e) => e.severity === 'critical').length,
    warning: errors.filter((e) => e.severity === 'warning').length,
  };

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
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}/files/${fileId}`}>index.html</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Hallazgos</li>
        </ol>
      </nav>

      {/* Header + Filter */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold fs-5 mb-0" style={{ color: 'var(--oc-navy)' }}>Hallazgos Detectados</h2>
        <ErrorFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
      </div>

      {isLoading && (
        <div className="alert alert-secondary" role="status">
          Cargando hallazgos del archivo...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="alert alert-warning" role="alert">
          {errorMessage}
          <div className="small mt-1">
            TODO: backend debe exponer endpoint de hallazgos por archivo para completar esta vista.
          </div>
        </div>
      )}

      {/* Error Cards */}
      <div className="d-flex flex-column gap-3">
        {filteredErrors.map((error) => (
          <ErrorCard key={error.id} error={error} />
        ))}
        {!isLoading && !errorMessage && filteredErrors.length === 0 && (
          <div className="alert alert-light border">
            No hay hallazgos disponibles para este archivo.
          </div>
        )}
      </div>
    </section>
  );
};

export default ErrorDetail;
