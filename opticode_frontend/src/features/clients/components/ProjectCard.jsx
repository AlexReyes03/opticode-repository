import { useNavigate } from 'react-router-dom';
import { PROJECT_DESCRIPTION_MAX_LENGTH } from '../../../api/project-services';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * @param {object} props
 * @param {{ id: number|string, name: string, description?: string, fileCount?: number, date?: string }} props.project
 * @param {(p: typeof props.project) => void} props.onEdit
 * @param {(p: typeof props.project) => void} props.onDelete
 */
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { id, name, description, fileCount, date } = project;
  const descPreview = description?.trim() ? description : 'Sin descripción';

  return (
    <div className="card h-100 border-0 shadow-sm overflow-visible">
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
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
            <h3 className="fw-semibold mb-0 fs-6 text-break min-w-0" style={{ color: 'var(--oc-navy)' }}>
              {name}
            </h3>
          </div>
          <div className="dropdown flex-shrink-0" style={{ zIndex: 2 }}>
            <button
              type="button"
              className="btn btn-sm border rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '2.25rem', height: '2.25rem' }}
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              aria-expanded="false"
              aria-label={`Opciones del proyecto ${name}`}
            >
              <MoreHorizIcon style={{ fontSize: '1.25rem', color: 'var(--oc-navy)' }} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-1" style={{ minWidth: '11rem' }}>
              <li>
                <button type="button" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => onEdit?.(project)}>
                  <EditOutlinedIcon style={{ fontSize: '1.125rem' }} className="text-secondary" aria-hidden />
                  Editar
                </button>
              </li>
              <li>
                <hr className="dropdown-divider my-0" />
              </li>
              <li>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                  onClick={() => onDelete?.(project)}
                >
                  <DeleteOutlineIcon style={{ fontSize: '1.125rem' }} aria-hidden />
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-grow-1 mb-2">
          <p
            className="text-secondary small mb-1"
            title={description?.trim() ? description.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH) : undefined}
            style={{
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {descPreview}
          </p>
          <span className="text-muted" style={{ fontSize: '0.65rem' }}>
            {(description?.length ?? 0)}/{PROJECT_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3 small text-secondary mb-3">
          <span className="d-flex align-items-center gap-1">
            <InsertDriveFileOutlinedIcon style={{ fontSize: '0.875rem' }} />
            {fileCount ?? 0} archivos
          </span>
          <span className="d-flex align-items-center gap-1">
            <CalendarTodayOutlinedIcon style={{ fontSize: '0.875rem' }} />
            {date ?? '—'}
          </span>
        </div>

        <button type="button" className="btn btn-primary w-100" onClick={() => navigate(`/projects/${id}`)}>
          Ver proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
