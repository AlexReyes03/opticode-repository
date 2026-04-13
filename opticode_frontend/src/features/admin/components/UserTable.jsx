import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StatusBadge from '../../../components/shared/StatusBadge';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';
import { suspendUser } from '../../../api/admin-services';
import { notifyError, notifySuccess } from '../../../utils/toast';

const UserTable = ({ users = [], onRefresh }) => {
  const handleSuspend = async (id) => {
    try {
      await suspendUser(id);
      if (onRefresh) await onRefresh();
      notifySuccess('Usuario suspendido correctamente.');
    } catch (error) {
      notifyError(
        getApiErrorMessage(error, 'No se pudo suspender el usuario. Intenta de nuevo.'),
      );
    }
  };

  return (
    <div className="card overflow-hidden">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            {['Nombre', 'Correo', 'Registro', 'Estado', 'Acciones'].map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="fw-medium">{user.name}</td>
              <td className="text-secondary">{user.email}</td>
              <td className="text-secondary">{user.registeredAt}</td>
              <td>
                <StatusBadge status={user.status} />
              </td>
              <td>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm d-flex align-items-center p-1"
                    title="Suspender"
                    onClick={() => handleSuspend(user.id)}
                  >
                    <BlockOutlinedIcon style={{ fontSize: '1rem' }} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center p-1"
                    title="Eliminar"
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
