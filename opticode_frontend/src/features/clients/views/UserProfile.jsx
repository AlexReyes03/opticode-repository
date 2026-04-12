import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

/**
 * @param {string|undefined|null} iso
 * @returns {string}
 */
function formatDateEs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(d);
  } catch {
    return '—';
  }
}

/**
 * @param {string|undefined|null} iso
 * @returns {string}
 */
function formatDateTimeEs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

const UserProfile = () => {
  const { user } = useAuth();

  const profile = useMemo(() => {
    if (!user || typeof user !== 'object') {
      return {
        displayName: '—',
        email: '—',
        roleLabel: '—',
        dateJoined: '—',
        lastPasswordChanged: '—',
      };
    }

    const first = typeof user.first_name === 'string' ? user.first_name.trim() : '';
    const last = typeof user.last_name === 'string' ? user.last_name.trim() : '';
    const fromNames = [first, last].filter(Boolean).join(' ').trim();
    const email = typeof user.email === 'string' ? user.email : '';
    const displayName = fromNames || email || 'Usuario';

    const isStaff = user.is_staff === true || user.is_superuser === true;
    const roleLabel = isStaff ? 'Personal / administración' : 'Usuario';

    return {
      displayName,
      email: email || '—',
      roleLabel,
      dateJoined: formatDateEs(user.date_joined),
      lastPasswordChanged: formatDateTimeEs(user.last_password_changed),
    };
  }, [user]);

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Mi Perfil</h1>
      </div>

      <div className="row justify-content-center">
        {/* Profile Card */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm p-4 p-md-5 w-100">
            {/* Avatar & Header */}
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-center gap-4 mb-5 border-bottom pb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light"
                style={{ width: '120px', height: '120px', color: 'var(--oc-primary)', border: '2px solid var(--oc-primary-light)' }}
              >
                <PersonIcon style={{ fontSize: '3.5rem' }} />
              </div>

              <div className="text-center text-sm-start" style={{ minWidth: 0 }}>
                <h3 className="fw-bold fs-4 mb-1 text-break" style={{ color: 'var(--oc-navy)' }}>{profile.displayName}</h3>
                <p className="text-secondary mb-0 text-break">{profile.email}</p>
              </div>
            </div>

            {/* Details */}
            <h4 className="fw-bold fs-6 mb-4" style={{ color: 'var(--oc-navy)' }}>Información Personal</h4>

            <div className="row g-4 mb-5">
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <PersonIcon />
                  </div>
                  <div>
                    <label className="text-muted small fw-medium mb-1 d-block">Nombre completo</label>
                    <span className="fw-medium">{profile.displayName}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <EmailOutlinedIcon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="text-muted small fw-medium mb-1 d-block">Correo electrónico</label>
                    <div className="fw-medium text-break">{profile.email}</div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <AdminPanelSettingsOutlinedIcon />
                  </div>
                  <div>
                    <label className="text-muted small fw-medium mb-1 d-block">Rol en la plataforma</label>
                    <span className="fw-medium">{profile.roleLabel}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <EventOutlinedIcon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="text-muted small fw-medium mb-1 d-block">Registro en OptiCode</label>
                    <div className="fw-medium text-break">{profile.dateJoined}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <h4 className="fw-bold fs-6 mb-4" style={{ color: 'var(--oc-navy)' }}>Seguridad</h4>
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 rounded gap-3" style={{ backgroundColor: 'var(--oc-gray-100)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-white rounded text-secondary shadow-sm">
                  <LockOutlinedIcon />
                </div>
                <div>
                  <h5 className="fs-6 fw-medium mb-1">Contraseña</h5>
                  <small className="text-muted d-block">
                    Último cambio:{' '}
                    <span className="text-body-secondary fw-medium">{profile.lastPasswordChanged}</span>
                  </small>
                </div>
              </div>
              <button className="btn btn-outline-secondary btn-sm flex-shrink-0 w-100" style={{ maxWidth: '120px' }}>
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
