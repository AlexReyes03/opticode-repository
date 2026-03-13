import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import AuthFormField from '../components/AuthFormField';
import logo from '../../../assets/img/ack_logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
            Recuperar Contraseña
          </h2>
          <p className="text-secondary small mb-4">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>

          {submitted && (
            <div className="alert alert-success text-start small" role="status">
              <MarkEmailReadOutlinedIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.375rem' }} />
              Si el correo existe, recibirás instrucciones para restablecer tu contraseña.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <AuthFormField
              id="forgot-email"
              label="Correo electrónico"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={EmailOutlinedIcon}
            />

            <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">
              Enviar instrucciones
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

export default ForgotPassword;
