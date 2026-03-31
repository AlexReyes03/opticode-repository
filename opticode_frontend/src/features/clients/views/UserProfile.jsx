import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const UserProfile = () => {
  const { user } = useAuth();

  const [profile] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    role: 'Desarrollador Frontend',
    company: 'Tech Solutions Inc.'
  });

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Mi Perfil</h1>
      </div>

      <div className="row">
        {/* Left Column: Avatar & Basic Info */}
        <div className="col-12 col-md-4 mb-4">
          <div className="card text-center border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light"
                style={{ width: '120px', height: '120px', color: 'var(--oc-primary)', border: '2px solid var(--oc-primary-light)' }}
              >
                <PersonIcon style={{ fontSize: '4rem' }} />
              </div>
            </div>
            <h3 className="fw-bold fs-5 mb-1 justify-content-center" style={{ color: 'var(--oc-navy)' }}>{profile.name}</h3>
            <p className="text-secondary mb-3">{profile.role}</p>
          </div>
        </div>

        {/* Right Column: Details & Security */}
        <div className="col-12 col-md-8 mb-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h4 className="fw-bold fs-6 mb-4" style={{ color: 'var(--oc-navy)' }}>Información Personal</h4>

            <div className="row g-4 mb-5">
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <PersonIcon />
                  </div>
                  <div>
                    <label className="text-muted small fw-medium mb-1 d-block">Nombre Completo</label>
                    <span className="fw-medium">{profile.name}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <EmailOutlinedIcon />
                  </div>
                  <div>
                    <label className="text-muted small fw-medium mb-1 d-block">Correo Electrónico</label>
                    <span className="fw-medium">{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <BadgeOutlinedIcon />
                  </div>
                  <div>
                    <label className="text-muted small fw-medium mb-1 d-block">Empresa / Organización</label>
                    <span className="fw-medium">{profile.company}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="mb-4 text-light" style={{ opacity: 0.1 }} />

            <h4 className="fw-bold fs-6 mb-4" style={{ color: 'var(--oc-navy)' }}>Seguridad</h4>
            <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: 'var(--oc-gray-100)' }}>
              <div className="d-flex align-items-center gap-3">
                <LockOutlinedIcon className="text-secondary" />
                <div>
                  <h5 className="fs-6 fw-medium mb-0">Contraseña</h5>
                  <small className="text-muted">Última actualización: hace 30 días</small>
                </div>
              </div>
              <button className="btn btn-outline-secondary btn-sm">
                Cambiar
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
