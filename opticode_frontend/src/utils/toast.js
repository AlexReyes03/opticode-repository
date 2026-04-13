import { toast } from 'react-toastify';

const DEFAULT_OPTIONS = {
  position: 'top-right',
  autoClose: 3500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const safeMessage = (message, fallback) => {
  const text = typeof message === 'string' ? message.trim() : '';
  return text || fallback;
};

export const notifySuccess = (message, options = {}) =>
  toast.success(safeMessage(message, 'Operación completada.'), {
    ...DEFAULT_OPTIONS,
    ...options,
  });

export const notifyError = (message, options = {}) =>
  toast.error(safeMessage(message, 'Ocurrió un error. Intenta de nuevo.'), {
    ...DEFAULT_OPTIONS,
    ...options,
  });

export const notifyInfo = (message, options = {}) =>
  toast.info(safeMessage(message, 'Información importante.'), {
    ...DEFAULT_OPTIONS,
    ...options,
  });
