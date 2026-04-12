import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../assets/img/ack_logo.png';

const AppLayout = () => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-start min-vh-100 min-w-0 w-100">
      {/* Mobile Topbar */}
      <header className="d-md-none bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between sticky-top z-3">
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="OptiCode" width={32} className="rounded" />
          <span className="fw-bold" style={{ color: 'var(--oc-navy)' }}>OptiCode</span>
        </div>
        <button
          className="btn btn-outline-secondary border-0 p-1"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
        >
          <MenuIcon />
        </button>
      </header>

      <Sidebar />
      <main className="flex-grow-1 min-w-0 bg-body-secondary app-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
