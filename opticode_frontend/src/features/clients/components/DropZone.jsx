import { useRef } from 'react';
import PropTypes from 'prop-types';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';

const iconMap = {
  individual: CloudUploadOutlinedIcon,
  batch: FolderZipOutlinedIcon,
};

const ACCEPT = {
  individual: '.html,.htm,.css',
  batch: '.zip',
};

/** Fondo en reposo (transparencia 0.04); hover/drag usan --oc-info-light */
const DROP_ZONE_IDLE_BG = 'rgba(37, 100, 235, 0.04)';
const DROP_ZONE_ACTIVE_BG = 'var(--oc-info-light)';
const DROP_ZONE_BORDER_IDLE = 'var(--oc-gray-400)';
/** Grosor y estilo fijos (no usar utilidades `.border*` de Bootstrap: llevan `!important` y anulan `borderColor` inline). */
const DROP_ZONE_BORDER_BASE = {
  borderWidth: '2px',
  borderStyle: 'dashed',
};

/**
 * Zona de arrastre y selección de archivos.
 *
 * @param {'individual'|'batch'} variant
 * @param {string} title
 * @param {string} description
 * @param {string} constraints
 * @param {(file: File) => void} [onFile] - Callback invocado con el archivo seleccionado o soltado.
 */
const DropZone = ({ variant = 'individual', title, description, constraints, onFile }) => {
  const Icon = iconMap[variant];
  const inputRef = useRef(null);

  const emitFile = (file) => {
    if (file) onFile?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = DROP_ZONE_BORDER_IDLE;
    e.currentTarget.style.backgroundColor = DROP_ZONE_IDLE_BG;
    emitFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--oc-royal)';
    e.currentTarget.style.backgroundColor = DROP_ZONE_ACTIVE_BG;
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.borderColor = DROP_ZONE_BORDER_IDLE;
    e.currentTarget.style.backgroundColor = DROP_ZONE_IDLE_BG;
  };

  const handleActivate = () => inputRef.current?.click();

  return (
    <button
      type="button"
      className="rounded-4 h-100 p-5 text-center min-w-0 w-100 border-0"
      style={{
        ...DROP_ZONE_BORDER_BASE,
        borderColor: DROP_ZONE_BORDER_IDLE,
        backgroundColor: DROP_ZONE_IDLE_BG,
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--oc-royal)';
        e.currentTarget.style.backgroundColor = DROP_ZONE_ACTIVE_BG;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = DROP_ZONE_BORDER_IDLE;
        e.currentTarget.style.backgroundColor = DROP_ZONE_IDLE_BG;
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleActivate}
      aria-label={`Zona de carga: ${title}. Activa para elegir archivo.`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[variant]}
        className="d-none"
        onChange={(e) => emitFile(e.target.files?.[0])}
        aria-hidden="true"
      />

      <div
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
        style={{
          width: '4rem',
          height: '4rem',
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.12)',
        }}
      >
        <Icon style={{ fontSize: '1.5rem', color: 'var(--oc-royal)' }} />
      </div>

      <h3 className="fw-medium fs-6 mb-2" style={{ color: 'var(--oc-navy)' }}>
        {title}
      </h3>

      <p className="text-secondary small mb-3">
        {description}{' '}
        <span className="fw-medium" style={{ color: 'var(--oc-royal)', cursor: 'pointer' }}>
          explora
        </span>
      </p>

      <div className="w-100 px-1 mt-1">
        <span
          className="badge bg-light text-secondary fw-normal rounded-2 px-2 py-2 text-wrap text-break text-center d-block mx-auto"
          style={{
            fontSize: 'clamp(0.65rem, 1.75vw, 0.75rem)',
            width: 'fit-content',
            maxWidth: '100%',
            boxSizing: 'border-box',
            lineHeight: 1.45,
            whiteSpace: 'normal',
          }}
        >
          {constraints}
        </span>
      </div>
    </button>
  );
};

DropZone.propTypes = {
  description: PropTypes.string.isRequired,
  onFile: PropTypes.func,
  variant: PropTypes.oneOf(['individual', 'batch']),
  title: PropTypes.string.isRequired,
  constraints: PropTypes.string.isRequired,
};

export default DropZone;
