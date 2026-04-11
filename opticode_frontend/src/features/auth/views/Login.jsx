import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AuthFormField from '../components/AuthFormField';
import { useAuth } from '../../../contexts/AuthContext';

const Login = () => {
  const location = useLocation();
  const { login, error: authError, loading, clearError } = useAuth();
  const [form, setForm] = useState(() => {
    const raw = location.state?.registeredEmail;
    const email =
      typeof raw === 'string' && raw.trim() ? raw.trim() : '';
    return { email, password: '' };
  });
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    const email = form.email.trim();
    const password = form.password.trim();
    return Boolean(email && password);
  }, [form.email, form.password]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();
    if (!email || !password) {
      setError('Introduce correo y contraseña.');
      return;
    }
    setError('');
    try {
      await login({ email, password });
    } catch {
      // El mensaje lo expone `authError` desde AuthContext (usa el cuerpo de error del fetch-wrapper).
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>
        Bienvenido de vuelta
      </h2>
      <p className="text-secondary small mb-4">
        Ingresa tus credenciales para acceder a tu cuenta.
      </p>

      {(error || authError) && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
          role="alert"
        >
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormField
          id="login-email"
          label="Correo electrónico"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={form.email}
          onChange={handleChange('email')}
          required
          icon={EmailOutlinedIcon}
        />

        <AuthFormField
          id="login-password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange('password')}
          required
          icon={LockOutlinedIcon}
          autoComplete="current-password"
        />

        <Link
          to="/forgot-password"
          className="d-block text-end small mb-3"
          style={{ fontSize: '0.75rem' }}
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Ingresando...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className="text-center text-secondary small mt-4">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;
