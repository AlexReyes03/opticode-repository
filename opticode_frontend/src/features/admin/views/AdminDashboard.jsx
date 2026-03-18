import { useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UserTable from '../components/UserTable';

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold fs-4" style={{ color: 'var(--oc-navy)' }}>Administración de Usuarios</h1>
        <div className="position-relative" style={{ width: '20rem' }}>
          <SearchOutlinedIcon
            className="position-absolute top-50 translate-middle-y"
            style={{ left: '0.75rem', fontSize: '1.125rem', color: 'var(--oc-gray-400)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            className="form-control"
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
