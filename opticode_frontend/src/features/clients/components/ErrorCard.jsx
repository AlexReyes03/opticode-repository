const ErrorCard = ({ error }) => {
  const { severity, level, title, description, line, codeLines: rawLines } = error;
  const codeLines = Array.isArray(rawLines) ? rawLines : [];
  const isCritical = severity === 'critical';
  const isImprovement = severity === 'improvement';

  const borderColor = isCritical
    ? 'var(--oc-danger)'
    : isImprovement
      ? 'var(--oc-royal)'
      : 'var(--oc-warning)';
  const badgeBg = isCritical
    ? 'rgba(239,68,68,0.1)'
    : isImprovement
      ? 'rgba(37,99,235,0.1)'
      : 'rgba(249,115,22,0.1)';
  const badgeColor = isCritical
    ? 'var(--oc-danger-dark)'
    : isImprovement
      ? '#1e3a8a'
      : 'var(--oc-warning-dark)';
  const severityLabel = isCritical ? 'Falta Crítica' : isImprovement ? 'Mejora Sugerida' : 'Advertencia';
  const badgeLabel = level ? `${severityLabel} • ${level}` : severityLabel;

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
        <div
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
          role={codeLines.length ? 'region' : undefined}
          aria-label={codeLines.length ? 'Fragmento de código relacionado' : undefined}
        >
          {codeLines.length === 0 ? (
            <div className="px-3 py-2 text-secondary small" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
              Sin fragmento de código disponible.
            </div>
          ) : (
            <div style={{ minWidth: 'min-content' }}>
              {codeLines.map((codeLine, idx) => {
                const isError = codeLine.lineNumber === line;
                return (
                  <div
                    key={`${codeLine.lineNumber}-${idx}`}
                    className="d-flex min-w-0"
                    style={{
                      backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                      borderLeft: isError ? '2px solid var(--oc-danger)' : '2px solid transparent',
                    }}
                  >
                    <div
                      className="flex-shrink-0 text-end user-select-none"
                      style={{
                        width: '2.5rem',
                        padding: '0.25rem 0.5rem 0.25rem 0',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        borderRight: '1px solid #334155',
                        color: isError ? '#fca5a5' : '#64748b',
                      }}
                    >
                      {codeLine.lineNumber}
                    </div>
                    <div
                      className="min-w-0"
                      style={{
                        padding: '0.25rem 1rem',
                        color: isError ? '#fecaca' : '#94a3b8',
                        whiteSpace: 'pre',
                        overflowX: 'visible',
                      }}
                    >
                      {codeLine.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
