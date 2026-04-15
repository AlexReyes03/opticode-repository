import PropTypes from 'prop-types';

const SEVERITY_THEME = {
  critical: {
    borderColor: 'var(--oc-danger)',
    badgeBg: 'rgba(239,68,68,0.1)',
    badgeColor: 'var(--oc-danger-dark)',
    severityLabel: 'Falta Crítica',
  },
  improvement: {
    borderColor: 'var(--oc-royal)',
    badgeBg: 'rgba(37,99,235,0.1)',
    badgeColor: '#1e3a8a',
    severityLabel: 'Mejora Sugerida',
  },
  warning: {
    borderColor: 'var(--oc-warning)',
    badgeBg: 'rgba(249,115,22,0.1)',
    badgeColor: 'var(--oc-warning-dark)',
    severityLabel: 'Advertencia',
  },
};

function themeForSeverity(severity) {
  if (severity === 'critical') return SEVERITY_THEME.critical;
  if (severity === 'improvement') return SEVERITY_THEME.improvement;
  return SEVERITY_THEME.warning;
}

function CodeLineRow({ codeLine, highlightLineNumber }) {
  const isHighlighted = codeLine.lineNumber === highlightLineNumber;
  const rowBg = isHighlighted ? 'rgba(239, 68, 68, 0.15)' : 'transparent';
  const borderLeft = isHighlighted ? '2px solid var(--oc-danger)' : '2px solid transparent';
  const gutterColor = isHighlighted ? '#fca5a5' : '#64748b';
  const codeColor = isHighlighted ? '#fecaca' : '#94a3b8';

  return (
    <div
      className="d-flex min-w-0"
      style={{
        backgroundColor: rowBg,
        borderLeft,
      }}
    >
      <div
        className="flex-shrink-0 text-end user-select-none"
        style={{
          width: '2.5rem',
          padding: '0.25rem 0.5rem 0.25rem 0',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          borderRight: '1px solid #334155',
          color: gutterColor,
        }}
      >
        {codeLine.lineNumber}
      </div>
      <div
        className="min-w-0"
        style={{
          padding: '0.25rem 1rem',
          color: codeColor,
          whiteSpace: 'pre',
          overflowX: 'visible',
        }}
      >
        {codeLine.content}
      </div>
    </div>
  );
}

CodeLineRow.propTypes = {
  codeLine: PropTypes.shape({
    lineNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  highlightLineNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const ErrorCard = ({ error }) => {
  const { severity, level, title, description, line, codeLines: rawLines } = error;
  const codeLines = Array.isArray(rawLines) ? rawLines : [];
  const theme = themeForSeverity(severity);
  const { borderColor, badgeBg, badgeColor, severityLabel } = theme;
  const badgeLabel = level ? `${severityLabel} • ${level}` : severityLabel;
  const hasCodeLines = codeLines.length > 0;

  return (
    <div
      className="card shadow-sm overflow-hidden min-w-0"
      style={{ borderLeft: `4px solid ${borderColor}`, borderRadius: '0 1rem 1rem 0' }}
    >
      <div className="card-body p-4 min-w-0">
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row align-items-start justify-content-between gap-2 mb-2 min-w-0">
          <div className="min-w-0 flex-grow-1">
            <span
              className="badge mb-2 d-inline-block text-wrap text-break text-start"
              style={{
                backgroundColor: badgeBg,
                color: badgeColor,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                maxWidth: '100%',
                whiteSpace: 'normal',
                lineHeight: 1.35,
              }}
            >
              {badgeLabel}
            </span>
            <h3 className="fw-bold fs-6 mb-0 text-break" style={{ color: 'var(--oc-gray-900)' }}>
              {title}
            </h3>
          </div>
          <div
            className="font-monospace small rounded-2 px-3 py-1 flex-shrink-0 align-self-start"
            style={{ backgroundColor: 'var(--oc-gray-100)', color: 'var(--oc-gray-600)', whiteSpace: 'nowrap' }}
          >
            Línea {line}
          </div>
        </div>

        {/* Description */}
        <p
          className="text-secondary small mb-3 text-break"
          style={{ lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        >
          {description}
        </p>

        {/* Code Snippet: scroll horizontal dentro del viewport, sin ensanchar la página */}
        <section
          className="rounded-3 min-w-0 w-100"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            fontSize: '0.875rem',
            maxWidth: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            contain: 'inline-size',
          }}
          aria-label={hasCodeLines ? 'Fragmento de código relacionado' : 'Sin fragmento de código disponible'}
        >
          {hasCodeLines ? (
            <div style={{ minWidth: 'min-content' }}>
              {codeLines.map((codeLine, idx) => (
                <CodeLineRow key={`${codeLine.lineNumber}-${idx}`} codeLine={codeLine} highlightLineNumber={line} />
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-secondary small" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
              Sin fragmento de código disponible.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

ErrorCard.propTypes = {
  error: PropTypes.shape({
    line: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    level: PropTypes.string,
    codeLines: PropTypes.arrayOf(
      PropTypes.shape({
        lineNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        content: PropTypes.string.isRequired,
      }),
    ),
    description: PropTypes.string,
    title: PropTypes.string,
    severity: PropTypes.oneOf(['critical', 'improvement', 'warning']),
  }).isRequired,
};

export default ErrorCard;
