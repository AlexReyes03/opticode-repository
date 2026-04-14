import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DropZone from '../components/DropZone';
import FileStatusList from '../components/FileStatusList';
import { useFileUpload } from '../hooks/useFileUpload';
import { getProjectById } from '../../../api/project-services';

const FileUpload = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { files, handleFile, removeFile } = useFileUpload(projectId);
  const [projectName, setProjectName] = useState('Proyecto');

  useEffect(() => {
    if (!projectId) return;
    let mounted = true;
    getProjectById(projectId)
      .then((project) => {
        if (!mounted) return;
        const name =
          project && typeof project.name === 'string' && project.name.trim()
            ? project.name.trim()
            : 'Proyecto';
        setProjectName(name);
      })
      .catch(() => {
        if (mounted) setProjectName('Proyecto');
      });
    return () => {
      mounted = false;
    };
  }, [projectId]);

  return (
    <section>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb align-items-center">
          <li className="breadcrumb-item">
            <button
              type="button"
              className="btn btn-link p-0 d-inline-flex align-items-center"
              style={{ color: 'var(--oc-navy)' }}
              aria-label="Regresar"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon style={{ fontSize: '1.25rem' }} />
            </button>
          </li>
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>{projectName}</Link>
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
            constraints="Soporte: .html, .css | 0 B – 10 MB"
            onFile={handleFile}
          />
        </div>
        <div className="col">
          <DropZone
            variant="batch"
            title="Carga en Lote (ZIP)"
            description="Arrastra tu archivo .zip comprimido aquí o"
            constraints="Máx. 50 archivos | ZIP 50 MB | HTML/CSS hasta 10 MB c/u"
            onFile={handleFile}
          />
        </div>
      </div>

      {/* Files list */}
      <FileStatusList files={files} projectId={projectId} onDelete={removeFile} />
    </section>
  );
};

export default FileUpload;
