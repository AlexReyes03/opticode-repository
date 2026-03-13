import { Outlet } from 'react-router-dom';
import logo from '../../assets/img/ack_logo.png';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Branding panel */}
      <div className="auth-layout__brand">
        <div className="auth-layout__brand-content">
          <img src={logo} alt="OptiCode logo" className="auth-layout__brand-logo" />
          <h1 className="auth-layout__brand-title">OptiCode</h1>
          <p className="auth-layout__brand-subtitle">
            Plataforma de auditoría de accesibilidad WCAG para tu código web.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-layout__form">
        <div className="auth-layout__form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
