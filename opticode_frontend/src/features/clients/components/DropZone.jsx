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
      style={{
        border: '2px dashed var(--oc-gray-300)',
        borderRadius: 'var(--oc-radius-xl)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color var(--oc-transition-fast), background-color var(--oc-transition-fast)',
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
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: 'var(--oc-radius-full)',
          backgroundColor: 'var(--oc-info-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <Icon style={{ fontSize: '1.5rem', color: 'var(--oc-royal)' }} />
      </div>

      <h3 style={{ fontSize: 'var(--oc-font-lg)', fontWeight: 500, color: 'var(--oc-navy)', marginBottom: '0.5rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)', marginBottom: '1rem' }}>
        {description}{' '}
        <span style={{ color: 'var(--oc-royal)', fontWeight: 500, cursor: 'pointer' }}>explora</span>
      </p>

      <span
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--oc-gray-100)',
          borderRadius: 'var(--oc-radius-md)',
          padding: '0.25rem 0.75rem',
          fontSize: 'var(--oc-font-xs)',
          color: 'var(--oc-gray-600)',
        }}
      >
        {constraints}
      </span>
    </div>
  );
};

export default DropZone;
