import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DropZone from '../components/DropZone';
import FileStatusList from '../components/FileStatusList';
import './FileUpload.css';

const MOCK_FILES = [
  { name: 'index.html', size: '1.2 MB', status: 'completed', score: 75 },
  { name: 'styles.css', size: '45 KB', status: 'analyzing' },
];

const FileUpload = () => {
  const { projectId } = useParams();

  return (
    <section className="file-upload">
      {/* Breadcrumb */}
      <div className="oc-breadcrumb">
        <Link to="/dashboard">Mis Proyectos</Link>
        <NavigateNextIcon style={{ fontSize: '1rem' }} />
        <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
        <NavigateNextIcon style={{ fontSize: '1rem' }} />
        <span className="active">Cargar</span>
      </div>

      <div className="file-upload__header">
        <h1 className="file-upload__title">Cargar Archivos al Proyecto</h1>
      </div>

      {/* Drop Zones */}
      <div className="file-upload__zones">
        <DropZone
          variant="individual"
          title="Archivo Individual"
          description="Arrastra tu archivo HTML o CSS aquí o"
          constraints="Soporte: .html, .css | 1KB - 10MB"
        />
        <DropZone
          variant="batch"
          title="Carga en Lote (ZIP)"
          description="Arrastra tu archivo .zip comprimido aquí o"
          constraints="Máx. 50 archivos | 50MB | Solo procesa HTML/CSS"
        />
      </div>

      {/* Files list */}
      <FileStatusList files={MOCK_FILES} />
    </section>
  );
};

export default FileUpload;
