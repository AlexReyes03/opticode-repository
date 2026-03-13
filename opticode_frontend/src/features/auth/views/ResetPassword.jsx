import { useState } from 'react';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import logo from '../../../assets/img/ack_logo.png';
import './ResetPassword.css';

const ResetPassword = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-layout--centered">
      <div className="auth-layout__card">
        <img src={logo} alt="OptiCode logo" className="auth-layout__card-logo" />
        <h2 style={{ fontSize: 'var(--oc-font-xl)', fontWeight: 700, color: 'var(--oc-navy)', marginBottom: '0.5rem' }}>
          Restablecer Contraseña
        </h2>
        <p style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)', marginBottom: '1.5rem' }}>
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
        </p>

        {submitted && (
          <div
            style={{
              backgroundColor: 'var(--oc-success-light)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 'var(--oc-radius-md)',
              padding: '0.75rem 1rem',
              fontSize: 'var(--oc-font-sm)',
              color: 'var(--oc-success-dark)',
              marginBottom: '1.25rem',
              textAlign: 'left',
            }}
            role="status"
          >
            Tu contraseña ha sido restablecida correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ textAlign: 'left' }}>
          <AuthFormField
            id="reset-password"
            label="Nueva contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            required
            icon={LockOutlinedIcon}
          />

          <PasswordStrengthIndicator password={form.password} />

          <div style={{ marginTop: '1.25rem' }}>
            <AuthFormField
              id="reset-confirm"
              label="Confirmar nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
              icon={LockOutlinedIcon}
            />
          </div>

          <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block" style={{ marginTop: '0.5rem' }}>
            Restablecer contraseña
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)' }}>
          <Link to="/login">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
