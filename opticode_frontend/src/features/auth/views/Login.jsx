import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AuthFormField from '../components/AuthFormField';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* Placeholder — se integrará con el backend posteriormente */
    if (!form.email || !form.password) {
      setError('Credenciales de acceso incorrectas.');
      return;
    }
    setError('');
  };

  return (
    <div className="login-view">
      <h2>Iniciar Sesión</h2>
      <p className="login-view__subtitle">Ingresa tus credenciales para acceder a tu cuenta.</p>

      {error && (
        <div className="login-view__error" role="alert">
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error}
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

        <Link to="/forgot-password" className="login-view__forgot">
          ¿Olvidaste tu contraseña?
        </Link>

        <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block">
          Entrar
        </button>
      </form>

      <p className="login-view__footer">
        ¿No tienes cuenta?{' '}
        <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;
