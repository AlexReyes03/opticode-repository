const variants = {
  active: {
    label: 'Activo',
    className: 'oc-badge oc-badge--success',
  },
  suspended: {
    label: 'Suspendido',
    className: 'oc-badge oc-badge--danger',
  },
};

const StatusBadge = ({ status }) => {
  const config = variants[status] ?? variants.active;
  return <span className={config.className}>{config.label}</span>;
};

export default StatusBadge;
