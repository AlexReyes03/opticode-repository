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
              className="list-group-item d-flex align-items-center justify-content-between px-0"
            >
              <div className="d-flex align-items-center gap-2">
                {getFileIcon(file.name)}
                <span className="fw-medium small">{file.name}</span>
                <span className="small text-secondary">{file.size}</span>
              </div>

              {file.status === 'uploading' ? (
                <span className="badge bg-info bg-opacity-10 text-primary d-flex align-items-center gap-1">
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: '0.625rem', height: '0.625rem', borderWidth: '2px' }}
                    aria-hidden="true"
                  />
                  Subiendo...
                </span>
              ) : (
                <span className="badge bg-success bg-opacity-10 text-success">
                  Completado - Eval: {file.score}
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
