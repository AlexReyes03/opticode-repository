import { useState, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const CreateProjectModal = ({ show, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const modalRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-labelledby="createProjectModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h3 className="modal-title fs-5 fw-semibold" id="createProjectModalLabel" style={{ color: 'var(--oc-navy)', borderLeft: '4px solid var(--oc-royal)', paddingLeft: '0.75rem' }}>
              Nuevo Proyecto
            </h3>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar modal"></button>
          </div>

          {/* Body */}
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
                    placeholder="Ej: Portal Educativo"
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
                  rows={3}
                  placeholder="Describe brevemente el propósito de este proyecto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
