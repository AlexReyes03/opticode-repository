import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';

const iconMap = {
  individual: CloudUploadOutlinedIcon,
  batch: FolderZipOutlinedIcon,
};

const DropZone = ({ variant = 'individual', title, description, constraints }) => {
  const Icon = iconMap[variant];

  return (
    <div
      className="border border-2 border-dashed rounded-4 p-5 text-center"
      style={{
        borderColor: 'var(--oc-gray-300)',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--oc-royal)';
        e.currentTarget.style.backgroundColor = 'var(--oc-info-light)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--oc-gray-300)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      role="button"
      tabIndex={0}
      aria-label={`Zona de carga: ${title}`}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
        style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--oc-info-light)' }}
      >
        <Icon style={{ fontSize: '1.5rem', color: 'var(--oc-royal)' }} />
      </div>

      <h3 className="fw-medium fs-6 mb-2" style={{ color: 'var(--oc-navy)' }}>
        {title}
      </h3>

      <p className="text-secondary small mb-3">
        {description}{' '}
        <span className="fw-medium" style={{ color: 'var(--oc-royal)', cursor: 'pointer' }}>explora</span>
      </p>

      <span
        className="badge bg-light text-secondary fw-normal rounded-2 px-3 py-1"
        style={{ fontSize: '0.75rem' }}
      >
        {constraints}
      </span>
    </div>
  );
};

export default DropZone;
