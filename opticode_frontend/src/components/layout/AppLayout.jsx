import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main
        className="flex-grow-1 bg-body-secondary"
        style={{ marginLeft: 'var(--oc-sidebar-width)', padding: '2rem 2.5rem', minHeight: '100vh' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
