const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Solo Críticos', dotColor: 'var(--oc-danger)' },
  { key: 'warning', label: 'Solo Advertencias', dotColor: 'var(--oc-warning)' },
];

const ErrorFilter = ({ activeFilter, onFilterChange, counts = {} }) => {
  return (
    <div
      className="d-flex flex-wrap align-items-stretch"
      role="group"
      aria-label="Filtro de errores"
      style={{ maxWidth: '100%', gap: '0.5rem' }}
    >
      {filters.map(({ key, label, dotColor }) => {
        const isActive = activeFilter === key;
        const count = counts[key] ?? 0;

        return (
          <button
            key={key}
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center justify-content-center gap-2 text-wrap text-center`}
            onClick={() => onFilterChange(key)}
            style={{ flex: '0 1 auto', minWidth: 0, maxWidth: '100%' }}
          >
            {dotColor && (
              <span
                className="rounded-circle d-inline-block flex-shrink-0"
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  backgroundColor: isActive ? 'var(--oc-white)' : dotColor,
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
