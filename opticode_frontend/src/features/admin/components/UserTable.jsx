import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StatusBadge from '../../../components/shared/StatusBadge';

const UserTable = ({ users = [] }) => {
  return (
    <div className="oc-card" style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--oc-gray-50)' }}>
          <tr>
            {['Nombre', 'Correo', 'Registro', 'Estado', 'Acciones'].map((header) => (
              <th
                key={header}
                style={{
                  padding: '0.875rem 1.5rem',
                  fontSize: 'var(--oc-font-xs)',
                  fontWeight: 600,
                  color: 'var(--oc-gray-500)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={{ borderTop: '1px solid var(--oc-gray-100)', transition: 'background-color var(--oc-transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--oc-gray-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '0.875rem 1.5rem', fontSize: 'var(--oc-font-sm)', fontWeight: 500 }}>
                {user.name}
              </td>
              <td style={{ padding: '0.875rem 1.5rem', fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-600)' }}>
                {user.email}
              </td>
              <td style={{ padding: '0.875rem 1.5rem', fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-500)' }}>
                {user.registeredAt}
              </td>
              <td style={{ padding: '0.875rem 1.5rem' }}>
                <StatusBadge status={user.status} />
              </td>
              <td style={{ padding: '0.875rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    title={user.status === 'active' ? 'Suspender' : 'Reactivar'}
                    style={{
                      background: 'none',
                      border: '1px solid var(--oc-gray-200)',
                      borderRadius: 'var(--oc-radius-md)',
                      padding: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      color: 'var(--oc-warning)',
                      transition: 'background-color var(--oc-transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--oc-warning-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <BlockOutlinedIcon style={{ fontSize: '1rem' }} />
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    style={{
                      background: 'none',
                      border: '1px solid var(--oc-gray-200)',
                      borderRadius: 'var(--oc-radius-md)',
                      padding: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      color: 'var(--oc-danger)',
                      transition: 'background-color var(--oc-transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--oc-danger-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <DeleteOutlineOutlinedIcon style={{ fontSize: '1rem' }} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
