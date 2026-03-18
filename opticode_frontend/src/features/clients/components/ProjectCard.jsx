import { useNavigate } from 'react-router-dom';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { id, name, description, fileCount, date } = project;

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column p-4">
        {/* Icon + Name */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <div
            className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--oc-info-light)',
            }}
          >
            <FolderOutlinedIcon style={{ fontSize: '1.25rem', color: 'var(--oc-royal)' }} />
          </div>
          <h3 className="fw-semibold mb-0 fs-6" style={{ color: 'var(--oc-navy)' }}>
            {name}
          </h3>
        </div>

        {/* Description */}
        <p
          className="text-secondary small flex-grow-1 mb-3"
          style={{
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
        <div className="d-flex align-items-center gap-3 small text-secondary mb-3">
          <span className="d-flex align-items-center gap-1">
            <InsertDriveFileOutlinedIcon style={{ fontSize: '0.875rem' }} />
            {fileCount} archivos
          </span>
          <span className="d-flex align-items-center gap-1">
            <CalendarTodayOutlinedIcon style={{ fontSize: '0.875rem' }} />
            {date}
          </span>
        </div>

        {/* Action */}
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={() => navigate(`/projects/${id}`)}
        >
          Ver proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
