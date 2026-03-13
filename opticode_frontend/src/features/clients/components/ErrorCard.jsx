const ErrorCard = ({ error }) => {
  const { severity, level, title, description, line, codeLines } = error;
  const isCritical = severity === 'critical';

  const borderColor = isCritical ? 'var(--oc-danger)' : 'var(--oc-warning)';
  const badgeBg = isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)';
  const badgeColor = isCritical ? 'var(--oc-danger-dark)' : 'var(--oc-warning-dark)';
  const badgeLabel = isCritical ? `Falta Crítica • ${level}` : `Advertencia • ${level}`;

  return (
    <div
      style={{
        backgroundColor: 'var(--oc-white)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '0 var(--oc-radius-xl) var(--oc-radius-xl) 0',
        boxShadow: 'var(--oc-shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                backgroundColor: badgeBg,
                color: badgeColor,
                fontSize: 'var(--oc-font-xs)',
                fontWeight: 700,
                borderRadius: 'var(--oc-radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              {badgeLabel}
            </span>
            <h3 style={{ fontSize: 'var(--oc-font-lg)', fontWeight: 700, color: 'var(--oc-gray-900)', margin: 0 }}>
              {title}
            </h3>
          </div>
          <div
            style={{
              fontSize: 'var(--oc-font-sm)',
              fontFamily: 'monospace',
              backgroundColor: 'var(--oc-gray-100)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--oc-radius-md)',
              color: 'var(--oc-gray-600)',
              whiteSpace: 'nowrap',
            }}
          >
            Línea {line}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-600)', marginBottom: '1rem', lineHeight: 1.5 }}>
          {description}
        </p>

        {/* Code Snippet */}
        <div
          style={{
            backgroundColor: '#0f172a',
            borderRadius: 'var(--oc-radius-lg)',
            overflow: 'hidden',
            border: '1px solid #334155',
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            fontSize: 'var(--oc-font-sm)',
          }}
        >
          {codeLines.map((codeLine) => {
            const isError = codeLine.lineNumber === line;
            return (
              <div
                key={codeLine.lineNumber}
                style={{
                  display: 'flex',
                  backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  borderLeft: isError ? '2px solid var(--oc-danger)' : '2px solid transparent',
                }}
              >
                <div
                  style={{
                    width: '2.5rem',
                    textAlign: 'right',
                    paddingRight: '0.5rem',
                    padding: '0.25rem 0.5rem 0.25rem 0',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    borderRight: '1px solid #334155',
                    color: isError ? '#fca5a5' : '#64748b',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  {codeLine.lineNumber}
                </div>
                <div
                  style={{
                    padding: '0.25rem 1rem',
                    color: isError ? '#fecaca' : '#94a3b8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre',
                  }}
                >
                  {codeLine.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
