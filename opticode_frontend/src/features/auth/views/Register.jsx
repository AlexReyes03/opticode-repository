import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { registerUser } from '../../../api/auth-services';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await registerUser({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      // Navegación al login, podrías pasar un estado para mostrar un mensaje de éxito allí.
      navigate('/login');
    } catch (err) {
      console.error('Error al registrar:', err);
      // Extrae mensaje de error según como tu backend regrese los errores (DRF)
      const data = err?.data;
      const errorMsg = data?.detail
        || data?.email?.[0]
        || data?.password?.[0]
        || data?.first_name?.[0]
        || data?.last_name?.[0]
        || err?.message
        || 'Ocurrió un error al crear tu cuenta. Intenta de nuevo.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>Crear Cuenta</h2>
      <p className="text-secondary small mb-4">Regístrate para comenzar a auditar tu código.</p>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormField
          id="register-first-name"
          label="Nombre"
          placeholder="Juan"
          value={form.first_name}
          onChange={handleChange('first_name')}
          required
          icon={PersonOutlineOutlinedIcon}
        />

        <AuthFormField
          id="register-last-name"
          label="Apellido"
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
          required
          icon={LockOutlinedIcon}
        />

        <PasswordStrengthIndicator password={form.password} />

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
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <p className="text-center text-secondary small mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;
