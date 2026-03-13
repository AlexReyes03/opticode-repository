import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import AuthFormField from '../components/AuthFormField';
import logo from '../../../assets/img/ack_logo.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-layout--centered">
      <div className="auth-layout__card">
        <img src={logo} alt="OptiCode logo" className="auth-layout__card-logo" />
        <h2 style={{ fontSize: 'var(--oc-font-xl)', fontWeight: 700, color: 'var(--oc-navy)', marginBottom: '0.5rem' }}>
          Recuperar Contraseña
        </h2>
        <p style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)', marginBottom: '1.5rem' }}>
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>

        {submitted && (
          <div className="forgot-password-view__success" role="status">
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

          <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block" style={{ marginTop: '0.5rem' }}>
            Enviar instrucciones
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)' }}>
          <Link to="/login">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
