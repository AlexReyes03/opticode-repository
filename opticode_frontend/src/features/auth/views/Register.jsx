import { useState } from 'react';
import { Link } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>Crear Cuenta</h2>
      <p className="text-secondary small mb-4">Regístrate para comenzar a auditar tu código.</p>

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormField
          id="register-name"
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={form.name}
          onChange={handleChange('name')}
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

        <button type="submit" className="btn btn-primary btn-lg w-100">
          Crear cuenta
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
