import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DropZone from '../components/DropZone';
import FileStatusList from '../components/FileStatusList';

const MOCK_FILES = [
  { name: 'index.html', size: '1.2 MB', status: 'completed', score: 75 },
  { name: 'styles.css', size: '45 KB', status: 'analyzing' },
];

const FileUpload = () => {
  const { projectId } = useParams();

  return (
    <section>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Cargar</li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Cargar Archivos al Proyecto</h1>
      </div>

      {/* Drop Zones */}
      <div className="row row-cols-1 row-cols-md-2 g-4 mb-4">
        <div className="col">
          <DropZone
            variant="individual"
            title="Archivo Individual"
            description="Arrastra tu archivo HTML o CSS aquí o"
            constraints="Soporte: .html, .css | 1KB - 10MB"
          />
        </div>
        <div className="col">
          <DropZone
            variant="batch"
            title="Carga en Lote (ZIP)"
            description="Arrastra tu archivo .zip comprimido aquí o"
            constraints="Máx. 50 archivos | 50MB | Solo procesa HTML/CSS"
          />
        </div>
      </div>

      {/* Files list */}
      <FileStatusList files={MOCK_FILES} />
    </section>
  );
};

export default FileUpload;
