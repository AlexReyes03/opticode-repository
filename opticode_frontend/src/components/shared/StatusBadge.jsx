import PropTypes from 'prop-types';

const variants = {
  active: {
    label: 'Activo',
    className: 'badge bg-success',
  },
  suspended: {
    label: 'Suspendido',
    className: 'badge bg-danger',
  },
};

const StatusBadge = ({ status }) => {
  const config = variants[status] ?? variants.active;
  return <span className={config.className}>{config.label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default StatusBadge;
