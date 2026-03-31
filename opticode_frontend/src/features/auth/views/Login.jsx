import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AuthFormField from '../components/AuthFormField';
import { useAuth } from '../../../contexts/AuthContext';

const Login = () => {
  const { login, error: authError, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Credenciales de acceso incorrectas.');
      return;
    }
    setError('');
    
    try {
      await login(form);
      // PublicRoute component will automatically intercept the state change and redirect.
    } catch (err) {
      console.error("Login falló:", err);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>Iniciar Sesión</h2>
      <p className="text-secondary small mb-4">Ingresa tus credenciales para acceder a tu cuenta.</p>

      {(error || authError) && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
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
        />

        <Link to="/forgot-password" className="d-block text-end small mb-3" style={{ fontSize: '0.75rem' }}>
          ¿Olvidaste tu contraseña?
        </Link>

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Ingresando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="text-center text-secondary small mt-4">
        ¿No tienes cuenta?{' '}
        <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;
