import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CssOutlinedIcon from '@mui/icons-material/CssOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.css')) return <CssOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-royal)' }} />;
  return <DescriptionOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-warning)' }} />;
};

const getCompletedLabel = (score) => {
  if (score != null && score !== '') return `Completado — eval: ${score}`;
  return 'Completado';
};

/**
 * @param {{ status: string, errorMessage?: string, score?: number|string }} file
 */
function renderFileStatusBadge(file) {
  if (file.status === 'uploading') {
    return (
      <span className="badge bg-info bg-opacity-10 text-primary d-inline-flex align-items-center gap-1">
        <span
          className="spinner-border spinner-border-sm"
          style={{ width: '0.625rem', height: '0.625rem', borderWidth: '2px' }}
          aria-hidden="true"
        />
        {' '}
        Subiendo…
      </span>
    );
  }

  if (file.status === 'error') {
    return (
      <output
        className="badge bg-danger bg-opacity-10 text-danger text-wrap text-break text-start"
        style={{ maxWidth: '16rem', whiteSpace: 'normal' }}
        aria-live="polite"
      >
        {file.errorMessage ?? 'Error durante la carga.'}
      </output>
    );
  }

  return (
    <span className="badge bg-success bg-opacity-10 text-success">
      {getCompletedLabel(file.score)}
    </span>
  );
}

const FileStatusList = ({ files = [], projectId, onDelete }) => {
  const navigate = useNavigate();

  const handleNameClick = (file) => {
    if (file.status !== 'completed') return;
    if (file.fileId) {
      navigate(`/projects/${projectId}/files/${file.fileId}`);
    } else {
      // ZIP — ver todas las incidencias en el dashboard del proyecto
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <div className="card">
      <div className="card-body p-4">
        <h4 className="fw-medium mb-3" style={{ color: 'var(--oc-navy)' }}>Archivos Recientes</h4>

        {files.length === 0 && (
          <p className="text-center text-secondary small py-3">
            Aún no se han subido archivos.
          </p>
        )}

        <div className="list-group list-group-flush">
          {files.map((file) => (
            <div
              key={file.name}
              className="list-group-item d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 px-0 py-2"
            >
              {/* Left: icon + name + size */}
              <div className="d-flex align-items-center gap-2 min-w-0">
                {getFileIcon(file.name)}
                <button
                  type="button"
                  className="btn btn-link p-0 fw-medium small text-break text-start"
                  style={{
                    color: file.status === 'completed' ? 'var(--oc-royal)' : 'inherit',
                    cursor: file.status === 'completed' ? 'pointer' : 'default',
                    textDecoration: file.status === 'completed' ? 'underline' : 'none',
                  }}
                  disabled={file.status !== 'completed'}
                  onClick={() => handleNameClick(file)}
                  title={file.status === 'completed' ? 'Ver incidencias' : undefined}
                >
                  {file.name}
                </button>
                <span className="small text-secondary flex-shrink-0">{file.size}</span>
              </div>

              {/* Right: badge + delete button */}
              <div className="d-flex align-items-center gap-2 align-self-sm-end flex-shrink-0">
                {renderFileStatusBadge(file)}

                {file.status !== 'uploading' && onDelete && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-inline-flex align-items-center p-1"
                    aria-label={`Eliminar ${file.name} de la lista`}
                    title="Eliminar de la lista"
                    onClick={() => onDelete(file.name)}
                  >
                    <DeleteOutlineIcon style={{ fontSize: '1rem' }} aria-hidden />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FileStatusList.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.string,
      status: PropTypes.oneOf(['uploading', 'error', 'completed']).isRequired,
      fileId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      errorMessage: PropTypes.string,
      score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ),
  onDelete: PropTypes.func,
};

export default FileStatusList;
