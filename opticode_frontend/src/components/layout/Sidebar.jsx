import { useCallback, useMemo, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import logo from '../../assets/img/ack_logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { getSidebarUserPresentation, getUserRole } from '../../utils/userRole';

/**
 * Tabla de navegación (mejor que `switch` para menús: un solo arreglo, filtro por rol y `.map`).
 * Mantener `to` alineado con rutas privadas en AppRouter.
 */

/**
 * Estado activo por defecto: coincidencia exacta o subruta.
 *
 * @param {string} to
 * @param {string} pathname
 */
function defaultNavActive(to, pathname) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * @type {Array<{
 *   id: string
 *   to: string
 *   label: string
 *   icon: import('react').ElementType
 *   visibleForRoles?: Array<'admin' | 'user'> | null
 *   isActive?: (pathname: string) => boolean
 * }>}
 */
const SIDEBAR_NAV_CONFIG = [
  {
    id: 'dashboard',
    to: '/dashboard',
    label: 'Mis Proyectos',
    icon: FolderCopyOutlinedIcon,
    visibleForRoles: null,
    isActive: (pathname) => pathname === '/dashboard' || pathname.startsWith('/projects'),
  },
  {
    id: 'admin',
    to: '/admin',
    label: 'Administración',
    icon: AdminPanelSettingsOutlinedIcon,
    visibleForRoles: ['admin'],
  },
  {
    id: 'profile',
    to: '/profile',
    label: 'Mi Perfil',
    icon: PersonOutlineOutlinedIcon,
    visibleForRoles: null,
  },
];

/**
 * @param {(typeof SIDEBAR_NAV_CONFIG)[number]} item
 * @param {string} pathname
 */
function isNavLinkActive(item, pathname) {
  if (typeof item.isActive === 'function') {
    return item.isActive(pathname);
  }
  return defaultNavActive(item.to, pathname);
}

/**
 * @param {typeof SIDEBAR_NAV_CONFIG} config
 * @param {'admin' | 'user'} role
 */
function filterSidebarNavByRole(config, role) {
  return config.filter((item) => {
    const allowed = item.visibleForRoles;
    if (!allowed || allowed.length === 0) return true;
    return allowed.includes(role);
  });
}

/** Cierra el offcanvas en viewport móvil (Bootstrap). */
function closeMobileOffcanvas() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!window.matchMedia('(max-width: 767.98px)').matches) return;
  const el = document.getElementById('sidebarMenu');
  const Offcanvas = window.bootstrap?.Offcanvas;
  if (!el || !Offcanvas) return;

  const hide = () => {
    const instance = Offcanvas.getInstance(el) ?? Offcanvas.getOrCreateInstance(el);
    instance.hide();
  };
  // Tras el clic en NavLink, dejar que React Router procese y luego cerrar (evita condiciones de carrera).
  queueMicrotask(hide);
}

/**
 * Ítem de navegación que corresponde a la ruta actual (misma lógica que el resaltado activo).
 *
 * @param {string} pathname
 * @param {typeof SIDEBAR_NAV_CONFIG} items
 */
function getActiveNavItemId(pathname, items) {
  const active = items.find((navItem) => isNavLinkActive(navItem, pathname));
  return active?.id ?? null;
}

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const logoutTitleId = useId();

  const mainNavItems = useMemo(() => {
    const role = getUserRole(user);
    return filterSidebarNavByRole(SIDEBAR_NAV_CONFIG, role);
  }, [user]);

  const sidebarUser = useMemo(() => getSidebarUserPresentation(user), [user]);

  /** En móvil, cierra el drawer solo si el enlace no es el de la sección ya visible. */
  const handleMainNavClick = useCallback(
    (clickedItem) => {
      const currentSectionId = getActiveNavItemId(location.pathname, mainNavItems);
      if (clickedItem.id !== currentSectionId) {
        closeMobileOffcanvas();
      }
    },
    [location.pathname, mainNavItems],
  );

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
  };

  const modal =
    typeof document !== 'undefined' && logoutModalOpen
      ? createPortal(
          <>
            <div className="modal-backdrop fade show" aria-hidden="true" onClick={() => setLogoutModalOpen(false)} />
            <dialog className="modal fade show d-block" open aria-labelledby={logoutTitleId}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={logoutTitleId}>
                      Cerrar sesión
                    </h5>
                    <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setLogoutModalOpen(false)} />
                  </div>
                  <div className="modal-body">¿Seguro que deseas cerrar sesión? Deberás volver a iniciar sesión para acceder a tu cuenta.</div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setLogoutModalOpen(false)}>
                      Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleConfirmLogout}>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </dialog>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <aside className="navbar-sidebar offcanvas-md offcanvas-start" tabIndex={-1} id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
        <div className="navbar-sidebar__logo position-relative">
          <img src={logo} alt="OptiCode logo" />
          <span className="navbar-sidebar__logo-text" id="sidebarMenuLabel">
            OptiCode
          </span>
          <button type="button" className="btn-close btn-close-white d-md-none position-absolute end-0 me-3" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Cerrar menú" />
        </div>

        <nav className="navbar-sidebar__nav" aria-label="Navegación principal">
          <ul className="navbar-sidebar__section">
            {mainNavItems.map((item) => {
              const { to, label, icon: Icon } = item;
              return (
                <li key={item.id} className="navbar-sidebar__item">
                  <NavLink
                    to={to}
                    onClick={() => handleMainNavClick(item)}
                    className={`rounded-3 navbar-sidebar__link ${isNavLinkActive(item, location.pathname) ? 'navbar-sidebar__link--active' : ''}`}
                  >
                    <Icon />
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <ul className="navbar-sidebar__section navbar-sidebar__section--bottom">
            <li className="navbar-sidebar__item">
              <div className="navbar-sidebar__user navbar-sidebar__user--footer mb-0 pb-0">
                <p className="navbar-sidebar__user-label">Sesión activa</p>
                <p className="navbar-sidebar__user-name" title={sidebarUser.title}>
                  {sidebarUser.shortLabel}
                </p>
              </div>
            </li>
            <li className="navbar-sidebar__item">
              <button
                type="button"
                className="navbar-sidebar__link"
                onClick={() => {
                  closeMobileOffcanvas();
                  setLogoutModalOpen(true);
                }}
                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <LogoutOutlinedIcon />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      {modal}
    </>
  );
};

export default Sidebar;
