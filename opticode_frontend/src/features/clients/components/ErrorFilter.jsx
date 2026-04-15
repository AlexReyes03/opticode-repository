import PropTypes from 'prop-types';

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Solo Críticos', dotColor: 'var(--oc-danger)' },
  { key: 'warning', label: 'Solo Advertencias', dotColor: 'var(--oc-warning)' },
  { key: 'improvement', label: 'Solo Mejoras', dotColor: 'var(--oc-royal)' },
];

const ErrorFilter = ({ activeFilter, onFilterChange, counts = {} }) => {
  return (
    <fieldset
      className="d-flex flex-wrap align-items-stretch"
      style={{ maxWidth: '100%', gap: '0.5rem' }}
    >
      <legend className="visually-hidden">Filtro de errores</legend>
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
    </fieldset>
  );
};

ErrorFilter.propTypes = {
  counts: PropTypes.shape({
    all: PropTypes.number,
    critical: PropTypes.number,
    warning: PropTypes.number,
    improvement: PropTypes.number,
  }),
  activeFilter: PropTypes.oneOf(['all', 'critical', 'warning', 'improvement']).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default ErrorFilter;
