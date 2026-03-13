import { useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UserTable from '../components/UserTable';
import './AdminDashboard.css';

const MOCK_USERS = [
  { id: 1, name: 'Carlos Méndez', email: 'carlos@ejemplo.com', registeredAt: '02 Mar 2026', status: 'active' },
  { id: 2, name: 'Ana Torres', email: 'ana.torres@ejemplo.com', registeredAt: '28 Feb 2026', status: 'active' },
  { id: 3, name: 'Roberto Díaz', email: 'r.diaz@ejemplo.com', registeredAt: '15 Feb 2026', status: 'suspended' },
  { id: 4, name: 'María López', email: 'maria.l@ejemplo.com', registeredAt: '10 Feb 2026', status: 'active' },
  { id: 5, name: 'Juan Hernández', email: 'juanh@ejemplo.com', registeredAt: '05 Feb 2026', status: 'suspended' },
];

const AdminDashboard = () => {
  const [search, setSearch] = useState('');

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Administración de Usuarios</h1>
        <div className="admin-dashboard__search">
          <SearchOutlinedIcon className="admin-dashboard__search-icon" />
          <input
            type="text"
            className="oc-input"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar usuarios"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <UserTable users={filtered} />
    </section>
  );
};

export default AdminDashboard;
