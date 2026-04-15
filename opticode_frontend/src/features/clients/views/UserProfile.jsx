import { useCallback, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AuthFormField from '../../auth/components/AuthFormField';
import PasswordStrengthIndicator from '../../auth/components/PasswordStrengthIndicator';
import { changePassword } from '../../../api/auth-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';

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
  const { user, refreshUser } = useAuth();
  const passwordModalTitleId = useId();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const profile = useMemo(() => {
    if (!user || typeof user !== 'object') {
      return {
        displayName: '—',
        email: '—',
        roleLabel: '—',
        dateJoined: '—',
        lastPasswordLabel: '—',
      };
    }

    const first = typeof user.first_name === 'string' ? user.first_name.trim() : '';
    const last = typeof user.last_name === 'string' ? user.last_name.trim() : '';
    const fromNames = [first, last].filter(Boolean).join(' ').trim();
    const email = typeof user.email === 'string' ? user.email : '';
    const displayName = fromNames || email || 'Usuario';

    const isAdmin = user.is_staff === true || user.is_superuser === true;
    const roleLabel = isAdmin ? 'Administrador' : 'Usuario';

    const lastPasswordLabel = user.last_password_changed
      ? formatDateTimeEs(user.last_password_changed)
      : 'Aún no se ha cambiado';

    return {
      displayName,
      email: email || '—',
      roleLabel,
      dateJoined: formatDateEs(user.date_joined),
      lastPasswordLabel,
    };
  }, [user]);

  const confirmFeedback = useMemo(() => {
    const confirm = pwdForm.confirm_password;
    if (!confirm) return null;
    if (pwdForm.new_password !== confirm) return 'mismatch';
    return 'match';
  }, [pwdForm.new_password, pwdForm.confirm_password]);

  const openPasswordModal = useCallback(() => {
    setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    setPwdError('');
    setPasswordFocused(false);
    setPasswordModalOpen(true);
  }, []);

  const handlePwdFieldChange = useCallback((field) => (e) => {
    setPwdForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (pwdError) setPwdError('');
  }, [pwdError]);

  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const current = pwdForm.current_password.trim();
      const next = pwdForm.new_password.trim();
      const confirm = pwdForm.confirm_password.trim();

      if (!current || !next || !confirm) {
        setPwdError('Por favor completa todos los campos.');
        return;
      }
      if (next !== confirm) {
        setPwdError('Las contraseñas no coinciden.');
        return;
      }

      setPwdError('');
      setPwdLoading(true);
      try {
        await changePassword({
          currentPassword: current,
          newPassword: next,
          confirmPassword: confirm,
        });
        setPasswordModalOpen(false);
        setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
        await refreshUser();
      } catch (err) {
        setPwdError(
          getApiErrorMessage(err, 'No se pudo actualizar la contraseña. Intenta de nuevo.'),
        );
      } finally {
        setPwdLoading(false);
      }
    },
    [pwdForm, refreshUser],
  );

  const passwordModal =
    typeof document !== 'undefined' && passwordModalOpen
      ? createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              aria-hidden="true"
              onClick={() => !pwdLoading && setPasswordModalOpen(false)}
            />
            <dialog className="modal fade show d-block" open aria-labelledby={passwordModalTitleId}>
              <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={passwordModalTitleId}>
                      Cambiar contraseña
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      disabled={pwdLoading}
                      onClick={() => setPasswordModalOpen(false)}
                    />
                  </div>
                  <form onSubmit={handlePasswordSubmit} noValidate>
                    <div className="modal-body">
                      {pwdError && (
                        <div
                          className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3"
                          role="alert"
                        >
                          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
                          {pwdError}
                        </div>
                      )}

                      <AuthFormField
                        id="profile-current-password"
                        label="Contraseña actual"
                        type="password"
                        placeholder="••••••••"
                        value={pwdForm.current_password}
                        onChange={handlePwdFieldChange('current_password')}
                        required
                        icon={LockOutlinedIcon}
                        autoComplete="current-password"
                      />

                      <AuthFormField
                        id="profile-new-password"
                        label="Nueva contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={pwdForm.new_password}
                        onChange={handlePwdFieldChange('new_password')}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        required
                        icon={LockOutlinedIcon}
                        autoComplete="new-password"
                      />

                      <PasswordStrengthIndicator
                        password={pwdForm.new_password}
                        visible={passwordFocused}
                      />

                      <div className="mt-3">
                        <AuthFormField
                          id="profile-confirm-password"
                          label="Confirmar contraseña"
                          type="password"
                          placeholder="••••••••"
                          value={pwdForm.confirm_password}
                          onChange={handlePwdFieldChange('confirm_password')}
                          required
                          icon={LockOutlinedIcon}
                          autoComplete="new-password"
                        />
                      </div>

                      {confirmFeedback === 'mismatch' && (
                        <output className="d-block mt-2 mb-0" aria-live="polite">
                          <span
                            className="d-flex align-items-center gap-2 mb-1 text-danger"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <ErrorOutlineIcon style={{ fontSize: '0.875rem' }} />
                            Las contraseñas no coinciden.
                          </span>
                        </output>
                      )}
                      {confirmFeedback === 'match' && (
                        <output className="d-block mt-2 mb-0" aria-live="polite">
                          <span
                            className="d-flex align-items-center gap-2 mb-1 text-success"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <CheckCircleOutlineIcon style={{ fontSize: '0.875rem' }} />
                            Las contraseñas coinciden.
                          </span>
                        </output>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={pwdLoading}
                        onClick={() => setPasswordModalOpen(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          pwdLoading ||
                          confirmFeedback === 'mismatch' ||
                          !pwdForm.current_password.trim() ||
                          !pwdForm.new_password.trim() ||
                          !pwdForm.confirm_password.trim()
                        }
                      >
                        {pwdLoading ? (
                          <>
                            <output
                              className="spinner-border spinner-border-sm me-2"
                              aria-live="polite"
                              aria-hidden="true"
                            />
                            {' '}
                            Guardando...
                          </>
                        ) : (
                          'Guardar contraseña'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </dialog>
          </>,
          document.body,
        )
      : null;

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Mi Perfil</h1>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm p-4 p-md-5 w-100">
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

            <h4 className="fw-bold fs-6 mb-4" style={{ color: 'var(--oc-navy)' }}>Información Personal</h4>

            <div className="row g-4 mb-5">
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-secondary">
                    <PersonIcon />
                  </div>
                  <div>
                    <div className="text-muted small fw-medium mb-1 d-block">Nombre completo</div>
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
                    <div className="text-muted small fw-medium mb-1 d-block">Correo electrónico</div>
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
                    <div className="text-muted small fw-medium mb-1 d-block">Rol en la plataforma</div>
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
                    <div className="text-muted small fw-medium mb-1 d-block">Registro en OptiCode</div>
                    <div className="fw-medium text-break">{profile.dateJoined}</div>
                  </div>
                </div>
              </div>
            </div>

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
                    <span className="text-body-secondary fw-medium">{profile.lastPasswordLabel}</span>
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-shrink-0 w-100"
                style={{ maxWidth: '120px' }}
                onClick={openPasswordModal}
              >
                Cambiar
              </button>
            </div>

          </div>
        </div>
      </div>
      {passwordModal}
    </section>
  );
};

export default UserProfile;
