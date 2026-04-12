import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ScoreDonutChart from '../components/ScoreDonutChart';
import { getFileReport } from '../../../api/file-services';

/** Niveles de conformidad WCAG — W3C / WAI (fuente oficial) */
const WCAG_LEVELS_DOC = 'https://www.w3.org/WAI/WCAG21/Understanding/conformance#levels-of-guidance';
const WCAG_CONFORMANCE_LINK_LABEL = 'Niveles de conformidad (W3C / WAI)';

/**
 * Normaliza la respuesta del backend al shape esperado por la vista.
 * Contrato esperado: GET /api/audit/:fileId/report/
 * { filename?, score, critical_count, warning_count, aaa_count? }
 */
const normalizeReportShape = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    score: Number(raw.score ?? 0),
    criticalCount: Number(raw.critical_count ?? raw.critical ?? 0),
    warningCount: Number(raw.warning_count ?? raw.warnings ?? 0),
    improvementCount: Number(raw.improvement_count ?? raw.aaa_count ?? 0),
    filename: raw.filename ?? null,
  };
};

const METRIC_COPY = {
  critical: {
    title: 'Faltas críticas',
    explanation:
      'Barreras de alto impacto que suelen impedir el acceso al contenido: por ejemplo inputs sin etiqueta accesible (WCAG 1.3.1, nivel A) o texto con contraste insuficiente (WCAG 1.4.3, nivel AA). Corresponden a hallazgos de severidad «error» del analizador y penalizan −10 puntos cada uno en el score.',
  },
  warning: {
    title: 'Advertencias',
    explanation:
      'Problemas de impacto moderado que dificultan la navegación o comprensión pero no bloquean el acceso por completo: por ejemplo saltos en la jerarquía de encabezados (WCAG 2.4.6, nivel AA). Corresponden a hallazgos de severidad «warning» y penalizan −5 puntos cada uno en el score.',
  },
  improvement: {
    title: 'Mejoras sugeridas',
    explanation:
      'Oportunidades de accesibilidad avanzada de bajo impacto inmediato: criterios aspiracionales como contraste reforzado (WCAG 1.4.6, nivel AAA) o presentación visual de texto (WCAG 1.4.8, nivel AAA). No penalizan el score — son sugerencias para ir más allá del mínimo requerido.',
  },
};

/**
 * Tarjeta de métrica expandible al clic; varias pueden permanecer abiertas a la vez.
 *
 * @param {object} props
 * @param {'critical'|'warning'|'aaa'} props.metricKey
 * @param {boolean} props.isOpen
 * @param {(k: 'critical'|'warning'|'aaa') => void} props.onToggle
 * @param {number} props.count
 * @param {import('react').ElementType} props.Icon
 * @param {typeof METRIC_COPY.critical} props.copy
 * @param {{ bg: string, border: string, iconBg: string, iconColor: string, numberColor: string, labelColor: string }} props.theme
 */
function ExpandableMetricCard({ metricKey, isOpen, onToggle, count, Icon, copy, theme }) {
  const handleActivate = useCallback(() => {
    onToggle(metricKey);
  }, [metricKey, onToggle]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate],
  );

  const stopCardToggle = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      aria-label={`${copy.title}: ${count}. Clic o Enter para ${isOpen ? 'ocultar' : 'mostrar'} la explicación.`}
      className={`card w-100 h-100 min-h-0 oc-file-report-card-hover d-flex flex-column ${isOpen ? 'overflow-y-auto' : ''}`}
      style={{
        backgroundColor: theme.bg,
        border: theme.border,
        cursor: 'pointer',
      }}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div className="d-flex flex-column p-3 min-w-0 align-items-stretch">
        <div className={`d-flex gap-3 min-w-0 align-items-start ${isOpen ? 'mb-2' : ''}`}>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: isOpen ? '2.25rem' : '3rem',
              height: isOpen ? '2.25rem' : '3rem',
              backgroundColor: theme.iconBg,
              color: theme.iconColor,
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            <Icon style={{ fontSize: isOpen ? '1.05rem' : '1.25rem' }} aria-hidden />
          </div>
          <div className="min-w-0 text-start">
            <div
              className={`fw-bold ${isOpen ? 'fs-4' : 'fs-3'} lh-1`}
              style={{ color: theme.numberColor, transition: 'font-size 0.2s ease' }}
            >
              {count}
            </div>
            <div
              className={`fw-semibold ${isOpen ? 'small' : 'small'} mt-1`}
              style={{ color: theme.labelColor, lineHeight: 1.35 }}
            >
              {copy.title}
            </div>
          </div>
        </div>

        <div
          className={`oc-file-report-expand-panel small text-start ${isOpen ? 'oc-file-report-expand-panel--open' : ''}`}
          aria-hidden={!isOpen}
        >
          <p className="mb-2" style={{ color: theme.labelColor, lineHeight: 1.55 }}>
            {copy.explanation}
          </p>
          <a
            href={WCAG_LEVELS_DOC}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isOpen ? 0 : -1}
            className="d-inline-flex align-items-center gap-1 fw-semibold text-decoration-none"
            style={{ color: 'var(--oc-royal)', fontSize: '0.8125rem' }}
            onClick={stopCardToggle}
          >
            {WCAG_CONFORMANCE_LINK_LABEL}
            <OpenInNewOutlinedIcon style={{ fontSize: '1rem' }} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Reporte de accesibilidad de un archivo analizado.
 * Lee el resultado desde GET /api/audit/:fileId/report/ (backend).
 */
const FileReport = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [reportLabel, setReportLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(() => ({
    critical: false,
    warning: false,
    improvement: false,
  }));

  const scoreCardRef = useRef(null);
  /** Alto intrínseco de la tarjeta de puntuación (px): la columna de métricas usa al menos esto; la puntuación no se estira con la fila. */
  const [scoreBlockMinPx, setScoreBlockMinPx] = useState(null);

  useLayoutEffect(() => {
    const el = scoreCardRef.current;
    if (!el || typeof window === 'undefined') return undefined;

    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

    const sync = () => {
      if (!isDesktop()) {
        setScoreBlockMinPx(null);
        return;
      }
      const h = el.getBoundingClientRect().height;
      setScoreBlockMinPx(Number.isFinite(h) ? Math.round(h) : null);
    };

    sync();
    const ro = new ResizeObserver(() => sync());
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [report, isLoading]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setReport(null);

      try {
        const raw = await getFileReport(projectId, fileId);
        const normalized = normalizeReportShape(raw);
        if (mounted) {
          setReport(normalized);
          setReportLabel(normalized?.filename ?? '');
        }
      } catch {
        if (mounted) setReport(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [projectId, fileId]);

  const toggleSection = useCallback((key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reportScore = Number(report?.score ?? 0);
  const reportCritical = Number(report?.criticalCount ?? 0);
  const reportWarnings = Number(report?.warningCount ?? 0);
  const reportImprovements = Number(report?.improvementCount ?? 0);
  const breadcrumbTitle = reportLabel || `Archivo ${fileId}`;

  const criticalTheme = {
    bg: 'var(--oc-danger-light)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: 'var(--oc-danger)',
    numberColor: 'var(--oc-danger-dark)',
    labelColor: '#7f1d1d',
  };

  const warningTheme = {
    bg: 'var(--oc-warning-light)',
    border: '1px solid rgba(249, 115, 22, 0.15)',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: 'var(--oc-warning)',
    numberColor: 'var(--oc-warning-dark)',
    labelColor: '#7c2d12',
  };

  const aaaTheme = {
    bg: 'var(--oc-info-light)',
    border: '1px solid rgba(37, 99, 235, 0.15)',
    iconBg: 'rgba(37, 99, 235, 0.12)',
    iconColor: 'var(--oc-royal)',
    numberColor: '#1e3a8a',
    labelColor: '#1e293b',
  };

  const cOpen = expandedSections.critical;
  const wOpen = expandedSections.warning;
  const iOpen = expandedSections.improvement;
  const flexCritical = `${cOpen ? 2 : 1} 1 0`;
  const flexWarning = `${wOpen ? 2 : 1} 1 0`;
  const flexImprovement = `${iOpen ? 2 : 1} 1 0`;

  return (
    <section className="min-w-0">
      <nav aria-label="breadcrumb" className="min-w-0">
        <ol className="breadcrumb flex-wrap">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} aria-hidden />
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} aria-hidden />
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {breadcrumbTitle}
          </li>
        </ol>
      </nav>

      <p className="text-secondary small mb-4" style={{ maxWidth: '42rem', lineHeight: 1.55 }}>
        Los totales resumen lo detectado en este archivo según el analizador. La definición oficial de los niveles de
        conformidad está en{' '}
        <a href={WCAG_LEVELS_DOC} target="_blank" rel="noopener noreferrer">
          {WCAG_CONFORMANCE_LINK_LABEL}
        </a>
        . Para cada incidencia concreta y sugerencias de corrección, usa «Ver hallazgos detectados».
      </p>

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

      <div className="oc-file-report-summary-grid mb-4" aria-busy={isLoading}>
        <div
          ref={scoreCardRef}
          className="card w-100 border oc-file-report-card-hover oc-file-report-summary-score d-flex flex-column p-3 min-h-0"
        >
          <h3
            className="text-uppercase small fw-semibold text-secondary mb-2 text-center"
            style={{ letterSpacing: '0.05em' }}
          >
            Puntuación Final
          </h3>
          <div className="flex-grow-1 d-flex align-items-center justify-content-center min-h-0 w-100 py-1">
            <ScoreDonutChart score={reportScore} />
          </div>
        </div>

        <div
          className="oc-file-report-metrics-stack w-100"
          style={scoreBlockMinPx != null ? { minHeight: `${scoreBlockMinPx}px` } : undefined}
        >
          <div className="d-flex flex-column min-h-0" style={{ flex: flexCritical }}>
            <ExpandableMetricCard
              metricKey="critical"
              isOpen={expandedSections.critical}
              onToggle={toggleSection}
              count={reportCritical}
              Icon={CloseOutlinedIcon}
              copy={METRIC_COPY.critical}
              theme={criticalTheme}
            />
          </div>
          <div className="d-flex flex-column min-h-0" style={{ flex: flexWarning }}>
            <ExpandableMetricCard
              metricKey="warning"
              isOpen={expandedSections.warning}
              onToggle={toggleSection}
              count={reportWarnings}
              Icon={WarningAmberOutlinedIcon}
              copy={METRIC_COPY.warning}
              theme={warningTheme}
            />
          </div>
          <div className="d-flex flex-column min-h-0" style={{ flex: flexImprovement }}>
            <ExpandableMetricCard
              metricKey="improvement"
              isOpen={expandedSections.improvement}
              onToggle={toggleSection}
              count={reportImprovements}
              Icon={AutoAwesomeOutlinedIcon}
              copy={METRIC_COPY.improvement}
              theme={aaaTheme}
            />
          </div>
        </div>
      </div>

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
