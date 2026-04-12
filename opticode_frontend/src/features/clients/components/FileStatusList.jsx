import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CssOutlinedIcon from '@mui/icons-material/CssOutlined';

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.css')) return <CssOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-royal)' }} />;
  return <DescriptionOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-warning)' }} />;
};

const FileStatusList = ({ files = [] }) => {
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
              <div className="d-flex align-items-center gap-2 min-w-0">
                {getFileIcon(file.name)}
                <span className="fw-medium small text-break">{file.name}</span>
                <span className="small text-secondary flex-shrink-0">{file.size}</span>
              </div>

              {file.status === 'uploading' ? (
                <span className="badge bg-info bg-opacity-10 text-primary d-inline-flex align-items-center gap-1 align-self-sm-end">
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: '0.625rem', height: '0.625rem', borderWidth: '2px' }}
                    aria-hidden="true"
                  />
                  Subiendo…
                </span>
              ) : file.status === 'error' ? (
                <span
                  className="badge bg-danger bg-opacity-10 text-danger text-wrap text-break text-start align-self-sm-end"
                  style={{ maxWidth: '100%', whiteSpace: 'normal' }}
                  role="status"
                >
                  {file.errorMessage ?? 'Error durante la carga.'}
                </span>
              ) : (
                <span className="badge bg-success bg-opacity-10 text-success align-self-sm-end">
                  {file.score != null && file.score !== ''
                    ? `Completado — eval: ${file.score}`
                    : 'Completado'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileStatusList;
