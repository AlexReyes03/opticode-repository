import { useState, useId } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StatusBadge from '../../../components/shared/StatusBadge';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';
import { deleteUser, suspendUser } from '../../../api/admin-services';
import { notifyError, notifySuccess } from '../../../utils/toast';

const UserTable = ({ users = [], onRefresh }) => {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const deleteTitleId = useId();

  const handleToggleSuspend = async (user) => {
    try {
      await suspendUser(user.id);
      if (onRefresh) await onRefresh();
      const action = user.status === 'active' ? 'suspendido' : 'activado';
      notifySuccess(`Usuario ${action} correctamente.`);
    } catch (error) {
      notifyError(
        getApiErrorMessage(error, 'No se pudo cambiar el estado del usuario. Intenta de nuevo.'),
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDelete.id);
      if (onRefresh) await onRefresh();
      notifySuccess('Usuario eliminado correctamente.');
      setPendingDelete(null);
    } catch (error) {
      notifyError(
        getApiErrorMessage(error, 'No se pudo eliminar el usuario. Intenta de nuevo.'),
      );
    } finally {
      setDeleting(false);
    }
  };

  const deleteModal =
    typeof document !== 'undefined' && pendingDelete
      ? createPortal(
          <>
            <div
              className="modal-backdrop fade show"
              aria-hidden="true"
              onClick={() => !deleting && setPendingDelete(null)}
            />
            <dialog className="modal fade show d-block" open aria-labelledby={deleteTitleId}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={deleteTitleId}>
                      Eliminar usuario
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      onClick={() => !deleting && setPendingDelete(null)}
                      disabled={deleting}
                    />
                  </div>
                  <div className="modal-body">
                    ¿Estás seguro de que deseas eliminar al usuario{' '}
                    <strong>{pendingDelete.name}</strong>? Esta acción no se puede deshacer.
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setPendingDelete(null)}
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteConfirm}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <output
                            className="spinner-border spinner-border-sm me-2"
                            aria-live="polite"
                            aria-hidden="true"
                          />
                          {' '}
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar'
                      )}
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
            {users.map((user) => {
              const isSuspended = user.status === 'suspended';

              return (
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
                        className={`btn btn-sm d-flex align-items-center p-1 ${
                          isSuspended ? 'btn-outline-success' : 'btn-outline-warning'
                        }`}
                        title={isSuspended ? 'Activar usuario' : 'Suspender usuario'}
                        onClick={() => handleToggleSuspend(user)}
                      >
                        {isSuspended ? (
                          <CheckCircleOutlineIcon style={{ fontSize: '1rem' }} />
                        ) : (
                          <BlockOutlinedIcon style={{ fontSize: '1rem' }} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm d-flex align-items-center p-1"
                        title="Eliminar usuario"
                        onClick={() => setPendingDelete({ id: user.id, name: user.name })}
                      >
                        <DeleteOutlineOutlinedIcon style={{ fontSize: '1rem' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {deleteModal}
    </>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
      registeredAt: PropTypes.string,
      status: PropTypes.string,
    }),
  ),
  onRefresh: PropTypes.func,
};

export default UserTable;
