import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { registerUser } from '../../../api/auth-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const canSubmit = useMemo(() => {
    const t = (v) => String(v ?? '').trim();
    return Boolean(
      t(form.first_name) &&
        t(form.last_name) &&
        t(form.email) &&
        t(form.password) &&
        t(form.confirmPassword)
    );
  }, [form]);

  const confirmFeedback = useMemo(() => {
    const confirm = form.confirmPassword;
    if (!confirm) return null;
    if (form.password !== confirm) return 'mismatch';
    return 'match';
  }, [form.password, form.confirmPassword]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const first_name = form.first_name.trim();
    const last_name = form.last_name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerUser({
        first_name,
        last_name,
        email,
        password,
      });
      navigate('/login', { state: { registeredEmail: email } });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Ocurrió un error al crear tu cuenta. Intenta de nuevo.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>
        Crea tu cuenta
      </h2>
      <p className="text-secondary small mb-4">
        Regístrate para comenzar a auditar tu código.
      </p>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
          role="alert"
        >
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormField
          id="register-first-name"
          label="Nombre(s)"
          placeholder="Juan"
          value={form.first_name}
          onChange={handleChange('first_name')}
          required
          icon={PersonOutlineOutlinedIcon}
        />

        <AuthFormField
          id="register-last-name"
          label="Apellido(s)"
          placeholder="Pérez"
          value={form.last_name}
          onChange={handleChange('last_name')}
          required
          icon={PersonOutlineOutlinedIcon}
        />

        <AuthFormField
          id="register-email"
          label="Correo electrónico"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={form.email}
          onChange={handleChange('email')}
          required
          icon={EmailOutlinedIcon}
        />

        <AuthFormField
          id="register-password"
          label="Contraseña"
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
            id="register-confirm"
            label="Confirmar contraseña"
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
          <ul className="list-unstyled mt-2 mb-0" role="status">
            <li
              className="d-flex align-items-center gap-2 mb-1 text-danger"
              style={{ fontSize: '0.75rem', transition: 'color 200ms ease' }}
            >
              <ErrorOutlineIcon style={{ fontSize: '0.875rem' }} />
              Las contraseñas no coinciden.
            </li>
          </ul>
        )}
        {confirmFeedback === 'match' && (
          <ul className="list-unstyled mt-2 mb-0" role="status">
            <li
              className="d-flex align-items-center gap-2 mb-1 text-success"
              style={{ fontSize: '0.75rem', transition: 'color 200ms ease' }}
            >
              <CheckCircleOutlineIcon style={{ fontSize: '0.875rem' }} />
              Las contraseñas coinciden.
            </li>
          </ul>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100 mt-3"
          disabled={
            loading || !canSubmit || confirmFeedback === 'mismatch'
          }
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <p className="text-center text-secondary small mt-4">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;
