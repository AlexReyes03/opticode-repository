import { NavLink, useLocation } from 'react-router-dom';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import logo from '../../assets/img/ack_logo.png';
import './Navbar.css';

const mainMenu = [
  { to: '/dashboard', label: 'Mis Proyectos', icon: FolderCopyOutlinedIcon },
  { to: '/admin', label: 'Administración', icon: AdminPanelSettingsOutlinedIcon },
  { to: '/profile', label: 'Mi Perfil', icon: PersonOutlineOutlinedIcon },
];

const bottomMenu = [
  { to: '/settings', label: 'Configuración', icon: SettingsOutlinedIcon },
];

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="navbar-sidebar" aria-label="Navegación principal">
      {/* Logo */}
      <div className="navbar-sidebar__logo">
        <img src={logo} alt="OptiCode logo" />
        <span className="navbar-sidebar__logo-text">OptiCode</span>
      </div>

      {/* Navigation */}
      <nav className="navbar-sidebar__nav">
        {/* Main section */}
        <ul className="navbar-sidebar__section">
          {mainMenu.map(({ to, label, icon: Icon }) => (
            <li key={to} className="navbar-sidebar__item">
              <NavLink
                to={to}
                className={`navbar-sidebar__link ${isActive(to) ? 'navbar-sidebar__link--active' : ''}`}
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom section */}
        <ul className="navbar-sidebar__section navbar-sidebar__section--bottom">
          {bottomMenu.map(({ to, label, icon: Icon }) => (
            <li key={to} className="navbar-sidebar__item">
              <NavLink
                to={to}
                className={`navbar-sidebar__link ${isActive(to) ? 'navbar-sidebar__link--active' : ''}`}
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
          <li className="navbar-sidebar__item">
            <button
              type="button"
              className="navbar-sidebar__link navbar-sidebar__link--danger"
              onClick={() => {/* logout logic */}}
              style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <LogoutOutlinedIcon />
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
