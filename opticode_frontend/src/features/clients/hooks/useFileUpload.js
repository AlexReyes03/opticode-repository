import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, uploadZip } from '../../../api/file-services';

/**
 * Formatea bytes a una cadena legible.
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

/**
 * Gestiona la subida de archivos individuales o ZIP a un proyecto.
 *
 * Flujo:
 *   1. Sube el archivo al backend vía uploadFile / uploadZip.
 *   2. Para archivos individuales: navega automáticamente a FileReport
 *      usando el fileId devuelto por el backend.
 *   3. Para ZIP: permanece en la vista de carga; el backend ejecuta
 *      run_audit() por cada archivo internamente.
 *
 * El análisis WCAG lo realiza exclusivamente el backend (run_audit).
 *
 * @param {string|number} projectId
 * @returns {{ files: Array<object>, handleFile: (file: File) => void }}
 */
export function useFileUpload(projectId) {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const patchFile = useCallback((name, patch) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, ...patch } : f)));
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      const isZip = file.name.toLowerCase().endsWith('.zip');

      setFiles((prev) => [
        ...prev.filter((f) => f.name !== file.name),
        { name: file.name, size: formatBytes(file.size), status: 'uploading' },
      ]);

      try {
        if (isZip) {
          await uploadZip(projectId, file);
          patchFile(file.name, { status: 'completed' });
        } else {
          const data = await uploadFile(projectId, file);
          const fileId = data?.id ?? null;
          patchFile(file.name, { status: 'completed', fileId });
          if (fileId) {
            navigate(`/projects/${projectId}/files/${fileId}`);
          }
        }
      } catch (err) {
        patchFile(file.name, {
          status: 'error',
          errorMessage: err?.message ?? 'Error durante la carga.',
        });
      }
    },
    [projectId, navigate, patchFile],
  );

  return { files, handleFile };
}
