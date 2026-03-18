const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Solo Críticos', dotColor: 'var(--oc-danger)' },
  { key: 'warning', label: 'Solo Advertencias', dotColor: 'var(--oc-warning)' },
];

const ErrorFilter = ({ activeFilter, onFilterChange, counts = {} }) => {
  return (
    <div className="btn-group" role="group" aria-label="Filtro de errores">
      {filters.map(({ key, label, dotColor }) => {
        const isActive = activeFilter === key;
        const count = counts[key] ?? 0;

        return (
          <button
            key={key}
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center gap-2`}
            onClick={() => onFilterChange(key)}
            style={{ whiteSpace: 'nowrap' }}
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
