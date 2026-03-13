import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CssOutlinedIcon from '@mui/icons-material/CssOutlined';

const getFileIcon = (fileName) => {
  if (fileName.endsWith('.css')) return <CssOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-royal)' }} />;
  return <DescriptionOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-warning)' }} />;
};

const FileStatusList = ({ files = [] }) => {
  return (
    <div className="oc-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontWeight: 500, color: 'var(--oc-navy)', marginBottom: '1rem' }}>Archivos Recientes</h4>

      {files.length === 0 && (
        <p style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-400)', textAlign: 'center', padding: '1rem 0' }}>
          Aún no se han subido archivos.
        </p>
      )}

      {files.map((file, idx) => (
        <div
          key={file.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: idx < files.length - 1 ? '1px solid var(--oc-gray-100)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {getFileIcon(file.name)}
            <span style={{ fontWeight: 500, fontSize: 'var(--oc-font-sm)' }}>{file.name}</span>
            <span style={{ fontSize: 'var(--oc-font-xs)', color: 'var(--oc-gray-400)' }}>{file.size}</span>
          </div>

          {file.status === 'analyzing' ? (
            <span className="oc-badge oc-badge--info" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span
                style={{
                  width: '0.625rem',
                  height: '0.625rem',
                  border: '2px solid var(--oc-royal)',
                  borderTopColor: 'transparent',
                  borderRadius: 'var(--oc-radius-full)',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
              Analizando...
            </span>
          ) : (
            <span className="oc-badge oc-badge--success">
              Completado - Eval: {file.score}
            </span>
          )}
        </div>
      ))}

      {/* Spinner keyframes inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FileStatusList;
