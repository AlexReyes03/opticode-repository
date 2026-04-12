import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorCard from '../components/ErrorCard';
import ErrorFilter from '../components/ErrorFilter';
import { getFileFindings } from '../../../api/file-services';
import { loadAuditResult } from '../utils/auditStorage';
import { sanitizeDescriptionText, sanitizeSnippetLine } from '../utils/snippetSanitize';
import { notifyInfo } from '../../../utils/toast';

/**
 * QA manual (sin recarga): con datos mixtos (críticos + advertencias), comprobar que
 * Todos/Críticos/Advertencias filtran la lista y los contadores del grupo coinciden.
 */

/**
 * Construye el array codeLines desde el shape del backend o análisis local.
 * @param {object} finding
 * @returns {Array<{ lineNumber: number, content: string }>}
 */
const normalizeCodeLines = (finding) => {
  if (Array.isArray(finding?.codeLines)) {
    return finding.codeLines.map((cl) => ({
      lineNumber: Number(cl.lineNumber ?? cl.line ?? 0),
      content: sanitizeSnippetLine(cl.content ?? ''),
    }));
  }
  if (!finding?.code_snippet) return [];

  const baseLineNumber = Number(finding.line_number ?? finding.line ?? 1);
  const lines = String(finding.code_snippet).split('\n');
  const startLine = lines.length === 3 ? baseLineNumber - 1 : baseLineNumber;

  return lines.map((content, index) => ({
    lineNumber: startLine + index,
    content: sanitizeSnippetLine(content),
  }));
};

/**
 * Normaliza un hallazgo (backend o local) al shape esperado por ErrorCard.
 */
const normalizeFinding = (finding, index) => {
  const rawSeverity = String(finding?.severity ?? '').toLowerCase();
  const severity = rawSeverity === 'error' || rawSeverity === 'critical' ? 'critical' : 'warning';
  return {
    id: finding?.id ?? `finding-${index}`,
    severity,
    level: finding?.level ?? (severity === 'critical' ? 'Nivel A' : 'Nivel AA'),
    title: finding?.title ?? finding?.wcag_rule ?? 'Hallazgo WCAG',
    description: sanitizeDescriptionText(
      finding?.message ?? finding?.description ?? 'Sin descripción disponible.'
    ),
    line: Number(finding?.line_number ?? finding?.line ?? 0),
    codeLines: normalizeCodeLines(finding),
  };
};

/**
 * Vista de detalle de hallazgos WCAG de un archivo.
 * Orden: GET /api/audit/:fileId/findings/ ; si falla, caché local (auditStorage).
 */
const ErrorDetail = () => {
  const { projectId, fileId } = useParams();
  const [filter, setFilter] = useState('all');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setErrors([]);
      setHasData(false);

      try {
        const list = await getFileFindings(projectId, fileId);
        if (!mounted) return;
        setErrors(Array.isArray(list) ? list.map(normalizeFinding) : []);
        setHasData(true);
      } catch {
        const result = loadAuditResult(projectId, fileId);
        const findings = result?.findings ?? [];
        if (mounted) {
          if (result !== null) {
            notifyInfo(
              'No se pudo consultar el servidor. Mostrando resultados guardados localmente.',
              { toastId: `findings-cache-${projectId}-${fileId}` },
            );
          }
          setErrors(findings.map(normalizeFinding));
          setHasData(result !== null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
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
    <section className="min-w-0">
      <nav aria-label="breadcrumb" className="min-w-0">
        <ol className="breadcrumb flex-wrap">
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
            <Link to={`/projects/${projectId}/files/${fileId}`}>{`Archivo ${fileId}`}</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Hallazgos</li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3 mb-4 min-w-0">
        <h2 className="fw-semibold fs-5 mb-0 flex-shrink-0" style={{ color: 'var(--oc-navy)' }}>
          Hallazgos Detectados
        </h2>
        <div className="min-w-0 w-100 w-lg-auto">
          <ErrorFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
        </div>
      </div>

      {isLoading && (
        <div className="alert alert-secondary" role="status">
          Cargando hallazgos del archivo...
        </div>
      )}

      {!isLoading && !hasData && (
        <div className="alert alert-warning" role="alert">
          No hay análisis disponible para este archivo.
          <div className="small mt-1">
            Confirma que el backend expone GET /api/audit/:fileId/findings/ o que exista
            análisis previo en este navegador (caché local).
          </div>
        </div>
      )}

      <div className="d-flex flex-column gap-3 min-w-0">
        {filteredErrors.map((error) => (
          <ErrorCard key={error.id} error={error} />
        ))}
        {!isLoading && hasData && filteredErrors.length === 0 && (
          <div className="alert alert-light border">
            No hay hallazgos para el filtro seleccionado.
          </div>
        )}
      </div>
    </section>
  );
};

export default ErrorDetail;
