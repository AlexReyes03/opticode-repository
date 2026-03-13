import { useState } from 'react';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthFormField from '../components/AuthFormField';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import logo from '../../../assets/img/ack_logo.png';

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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4 text-center mx-auto" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body">
          <img src={logo} alt="OptiCode logo" className="auth-card-logo mb-4" />
          <h2 className="fw-bold mb-2" style={{ fontSize: '1.25rem', color: 'var(--oc-navy)' }}>
            Restablecer Contraseña
          </h2>
          <p className="text-secondary small mb-4">
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
          </p>

          {submitted && (
            <div className="alert alert-success text-start small" role="status">
              Tu contraseña ha sido restablecida correctamente.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="text-start">
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
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">
              Restablecer contraseña
            </button>
          </form>

          <p className="text-secondary small mt-4">
            <Link to="/login">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
