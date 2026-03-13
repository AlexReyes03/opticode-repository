import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const CreateProjectModal = ({ show, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    /* Placeholder — se integrará con el backend posteriormente */
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: 'var(--oc-white)',
            borderRadius: 'var(--oc-radius-xl)',
            boxShadow: 'var(--oc-shadow-xl)',
            width: '100%',
            maxWidth: '32rem',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--oc-gray-100)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--oc-font-xl)',
                fontWeight: 600,
                color: 'var(--oc-navy)',
                borderLeft: '4px solid var(--oc-royal)',
                paddingLeft: '0.75rem',
                margin: 0,
              }}
            >
              Nuevo Proyecto
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--oc-gray-400)',
                display: 'flex',
                padding: '0.25rem',
                borderRadius: 'var(--oc-radius-sm)',
              }}
              aria-label="Cerrar modal"
            >
              <CloseIcon style={{ fontSize: '1.25rem' }} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="project-name" className="oc-label">
                  Nombre del proyecto <span style={{ color: 'var(--oc-danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="project-name"
                    type="text"
                    className="oc-input"
                    placeholder="Ej: Portal Educativo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 'var(--oc-font-xs)',
                      color: 'var(--oc-gray-400)',
                    }}
                  >
                    {name.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="project-desc" className="oc-label">
                  Descripción (opcional)
                </label>
                <textarea
                  id="project-desc"
                  className="oc-input"
                  rows={3}
                  placeholder="Describe brevemente el propósito de este proyecto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'var(--oc-gray-50)',
                borderTop: '1px solid var(--oc-gray-100)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button type="button" className="oc-btn oc-btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="oc-btn oc-btn-primary">
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;
