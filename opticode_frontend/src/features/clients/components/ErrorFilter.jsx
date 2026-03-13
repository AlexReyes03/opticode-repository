const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Solo Críticos', dotColor: 'var(--oc-danger)' },
  { key: 'warning', label: 'Solo Advertencias', dotColor: 'var(--oc-warning)' },
];

const ErrorFilter = ({ activeFilter, onFilterChange, counts = {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--oc-gray-100)',
        padding: '0.25rem',
        borderRadius: 'var(--oc-radius-lg)',
        gap: '0.125rem',
      }}
    >
      {filters.map(({ key, label, dotColor }) => {
        const isActive = activeFilter === key;
        const count = counts[key] ?? 0;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            style={{
              padding: '0.375rem 1rem',
              fontSize: 'var(--oc-font-sm)',
              fontWeight: 500,
              fontFamily: 'var(--oc-font-family)',
              borderRadius: 'var(--oc-radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all var(--oc-transition-fast)',
              backgroundColor: isActive ? 'var(--oc-white)' : 'transparent',
              color: isActive ? 'var(--oc-royal)' : 'var(--oc-gray-600)',
              boxShadow: isActive ? 'var(--oc-shadow-sm)' : 'none',
            }}
          >
            {dotColor && (
              <span
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: 'var(--oc-radius-full)',
                  backgroundColor: dotColor,
                  flexShrink: 0,
                }}
              />
            )}
            {label} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default ErrorFilter;
