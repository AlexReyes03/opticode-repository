import { useState, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UserTable from '../components/UserTable';
import { getUsers } from '../../../api/admin-services';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <UserTable users={filtered} onRefresh={fetchUsers} />
      )}
    </section>
  );
};

export default AdminDashboard;
