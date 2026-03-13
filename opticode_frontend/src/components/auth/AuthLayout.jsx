import { Outlet } from 'react-router-dom';
import logo from '../../assets/img/ack_logo.png';

const AuthLayout = () => {
  return (
    <div className="d-flex vh-100">
      {/* Branding panel */}
      <div className="auth-brand-panel flex-shrink-0 d-none d-lg-flex flex-column align-items-center justify-content-center p-5" style={{ flexBasis: '45%' }}>
        <div className="position-relative" style={{ zIndex: 1, textAlign: 'center' }}>
          <img src={logo} alt="OptiCode logo" className="auth-brand-logo mb-4" />
          <h1 className="fs-2 fw-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>OptiCode</h1>
          <p className="text-white-50" style={{ maxWidth: '300px', lineHeight: 1.6 }}>
            Plataforma de auditoría de accesibilidad WCAG para tu código web.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-5 bg-white">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
