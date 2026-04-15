import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';

/**
 * Mismas reglas que el backend (RegisterSerializer) y PasswordStrengthIndicator.
 * @param {string} value
 */
function passwordMeetsPolicy(value) {
  if (value.length < 8) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/\d/.test(value)) return false;
  return true;
}

const ResetPassword = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    const p = form.password.trim();
    const c = form.confirmPassword.trim();
    return Boolean(p && c);
  }, [form.password, form.confirmPassword]);

  const confirmFeedback = useMemo(() => {
    const confirm = form.confirmPassword;
    if (!confirm) return null;
    if (form.password !== confirm) return 'mismatch';
    return 'match';
  }, [form.password, form.confirmPassword]);

  const policyOk = useMemo(
    () => passwordMeetsPolicy(form.password),
    [form.password]
  );

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!password || !confirmPassword) {
      setError('Completa ambos campos de contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.'
      );
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Placeholder: sustituir por resetPassword({ uid, token, new_password }) cuando el backend esté listo.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'No se pudo restablecer la contraseña. Intenta de nuevo.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>
        Restablecer contraseña
      </h2>
      <p className="text-secondary small mb-4">
        Elige una nueva contraseña segura para recuperar el acceso a tu cuenta.
      </p>

      {submitted && (
        <output
          className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4"
          aria-live="polite"
        >
          <CheckCircleOutlineIcon style={{ fontSize: '1.125rem' }} />
          Contraseña actualizada (flujo de demostración; pendiente de conectar con el API real).
        </output>
      )}

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
          role="alert"
        >
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error}
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="reset-password"
            label="Nueva contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
            icon={LockOutlinedIcon}
            autoComplete="new-password"
          />

          <PasswordStrengthIndicator
            password={form.password}
            visible={passwordFocused}
          />

          <div className="mt-3">
            <AuthFormField
              id="reset-confirm"
              label="Confirmar nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
              icon={LockOutlinedIcon}
              autoComplete="new-password"
            />
          </div>

          {confirmFeedback === 'mismatch' && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2 small mt-2 mb-0"
              role="alert"
            >
              <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
              Las contraseñas no coinciden.
            </div>
          )}
          {confirmFeedback === 'match' && (
            <div
              className="alert alert-success d-flex align-items-center gap-2 py-2 small mt-2 mb-0"
              role="alert"
            >
              <CheckCircleOutlineIcon style={{ fontSize: '1.125rem' }} />
              Las contraseñas coinciden.
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-3"
            disabled={
              loading ||
              !canSubmit ||
              confirmFeedback === 'mismatch' ||
              !policyOk
            }
          >
            {loading ? (
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
              'Restablecer contraseña'
            )}
          </button>
        </form>
      )}

      <p className="text-center text-secondary small mt-4">
        <Link to="/login">Volver al inicio de sesión</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
