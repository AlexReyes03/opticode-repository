import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorCard from '../components/ErrorCard';
import ErrorFilter from '../components/ErrorFilter';
import { loadAuditResult } from '../utils/auditStorage';

/**
 * Normaliza el array codeLines desde distintos shapes (local vs. backend).
 * @param {object} finding
 * @returns {Array<{ lineNumber: number, content: string }>}
 */
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

/**
 * Normaliza un hallazgo a la forma esperada por ErrorCard.
 * Compatible con el shape local de htmlSyntaxAnalyzer y con el shape del backend
 * (cuando el endpoint GET /api/audit/<fileId>/findings/ esté disponible).
 *
 * TODO(backend): Al activar getFileFindings() en file-services.js, los hallazgos
 * del backend pasarán por aquí sin cambios adicionales gracias al mapeo defensivo.
 *
 * @param {object} finding
 * @param {number} index
 */
const normalizeFinding = (finding, index) => {
  const rawSeverity = String(finding?.severity ?? '').toLowerCase();
  const severity = rawSeverity === 'error' || rawSeverity === 'critical'
    ? 'critical'
    : 'warning';
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

/**
 * Vista de detalle de hallazgos WCAG de un archivo.
 *
 * Lee los findings del análisis estático local almacenados en localStorage
 * por useFileUpload tras la subida del archivo.
 *
 * HU-3.2 (semántica y atributos base — Nivel A): las reglas `<html>` sin `lang` e `<img>`
 * sin `alt` se detectan en `utils/htmlSyntaxAnalyzer.js` (analyzeHtmlSyntax), no aquí.
 * Esta vista solo normaliza y muestra cada finding (línea, severidad crítica, snippet).
 *
 * TODO(backend): Cuando el endpoint GET /api/audit/<fileId>/findings/ esté disponible,
 * reemplazar loadAuditResult() por getFileFindings(projectId, fileId) de file-services.js
 * y mapear la respuesta a través de normalizeFinding.
 */
const ErrorDetail = () => {
  const { projectId, fileId } = useParams();
  const [filter, setFilter] = useState('all');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const result = loadAuditResult(projectId, fileId);
    const findings = result?.findings ?? [];
    setErrors(findings.map(normalizeFinding));
    setHasData(result !== null);
    setIsLoading(false);
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
            <Link to={`/projects/${projectId}/files/${fileId}`}>{`Archivo ${fileId}`}</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Hallazgos</li>
        </ol>
      </nav>

      {/* Header + Filter */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold fs-5 mb-0" style={{ color: 'var(--oc-navy)' }}>
          Hallazgos Detectados
        </h2>
        <ErrorFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
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
            Sube el archivo desde la vista de carga para generar los hallazgos de accesibilidad.
          </div>
        </div>
      )}

      {/* Error Cards */}
      <div className="d-flex flex-column gap-3">
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
