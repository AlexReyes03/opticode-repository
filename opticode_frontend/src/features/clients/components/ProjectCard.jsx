import { useNavigate } from 'react-router-dom';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { id, name, description, fileCount, date } = project;

  return (
    <div className="oc-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--oc-radius-md)',
            backgroundColor: 'var(--oc-info-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FolderOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-royal)' }} />
        </div>
        <h3 style={{ fontSize: 'var(--oc-font-lg)', fontWeight: 600, color: 'var(--oc-navy)', margin: 0 }}>
          {name}
        </h3>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--oc-font-sm)',
          color: 'var(--oc-gray-500)',
          flex: 1,
          marginBottom: '1rem',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {description}
      </p>

      {/* Meta */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: 'var(--oc-font-xs)',
          color: 'var(--oc-gray-400)',
          marginBottom: '1rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <InsertDriveFileOutlinedIcon style={{ fontSize: '0.875rem' }} />
          {fileCount} archivos
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CalendarTodayOutlinedIcon style={{ fontSize: '0.875rem' }} />
          {date}
        </span>
      </div>

      {/* Action */}
      <button
        type="button"
        className="oc-btn oc-btn-primary oc-btn-block"
        onClick={() => navigate(`/projects/${id}`)}
      >
        Ver proyecto
      </button>
    </div>
  );
};

export default ProjectCard;
