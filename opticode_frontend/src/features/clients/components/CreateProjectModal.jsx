import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  createProject,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  updateProject,
} from '../../../api/project-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';
import { notifyError } from '../../../utils/toast';

/**
 * @param {boolean} show
 * @param {() => void} onClose
 * @param {(meta?: { mode: 'create' | 'edit' }) => void} [onProjectCreated] Tras crear o guardar edición.
 * @param {{ id: number|string, name?: string, description?: string }|null} [projectToEdit] Si viene definido, modo edición.
 */
const CreateProjectModal = ({ show, onClose, onProjectCreated, projectToEdit = null }) => {
  const isEdit = Boolean(projectToEdit?.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    if (isEdit && projectToEdit) {
      setName(typeof projectToEdit.name === 'string' ? projectToEdit.name : '');
      setDescription(typeof projectToEdit.description === 'string' ? projectToEdit.description : '');
    } else if (!isEdit) {
      setName('');
      setDescription('');
    }
  }, [show, isEdit, projectToEdit]);

  useEffect(() => {
    if (!modalRef.current) return;
    const bsModal = window.bootstrap?.Modal;
    if (!bsModal) return;

    let instance = bsModal.getInstance(modalRef.current);
    if (!instance) {
      instance = new bsModal(modalRef.current, { backdrop: true, keyboard: true });
    }

    if (show) {
      instance.show();
    } else {
      instance.hide();
    }
  }, [show]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const handleHidden = () => onClose();
    el.addEventListener('hidden.bs.modal', handleHidden);
    return () => el.removeEventListener('hidden.bs.modal', handleHidden);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await updateProject(projectToEdit.id, { name: name.trim(), description: description.trim() });
      } else {
        await createProject({ name: name.trim(), description: description.trim() });
      }
      onClose();
      if (onProjectCreated) {
        onProjectCreated({ mode: isEdit ? 'edit' : 'create' });
      }
    } catch (err) {
      notifyError(
        getApiErrorMessage(
          err,
          isEdit
            ? 'No se pudieron guardar los cambios. Intenta de nuevo.'
            : 'Ocurrió un error al crear el proyecto. Intenta de nuevo.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isEdit ? 'Editar proyecto' : 'Nuevo proyecto';
  const loadingLabel = isEdit ? 'Guardando…' : 'Creando…';
  const idleLabel = isEdit ? 'Guardar cambios' : 'Crear proyecto';
  const submitLabel = loading ? loadingLabel : idleLabel;

  return (
    <div className="modal fade" ref={modalRef} tabIndex={-1} aria-labelledby="projectModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h3
              className="modal-title fs-5 fw-semibold"
              id="projectModalLabel"
            >
              {title}
            </h3>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar modal" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="project-name" className="form-label">
                  Nombre del proyecto <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    id="project-name"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Portal educativo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                  <span
                    className="position-absolute top-50 translate-middle-y text-secondary"
                    style={{ right: '0.75rem', fontSize: '0.75rem' }}
                  >
                    {name.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="project-desc" className="form-label">
                  Descripción (opcional)
                </label>
                <textarea
                  id="project-desc"
                  className="form-control"
                  rows={2}
                  placeholder="Describe brevemente el propósito de este proyecto…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH))}
                  maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                  style={{ resize: 'vertical', minHeight: '4.5rem', maxHeight: '12rem' }}
                />
                <div className="text-end text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                  {description.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateProjectModal.propTypes = {
  projectToEdit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  onProjectCreated: PropTypes.func,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateProjectModal;
