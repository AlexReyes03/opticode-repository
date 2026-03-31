import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, uploadZip } from '../../../api/file-services';
import { analyzeHtmlSyntax } from '../utils/htmlSyntaxAnalyzer';
import { storeAuditResult } from '../utils/auditStorage';

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
 * Flujo para archivos HTML:
 *   1. Lee el contenido del archivo con FileReader.
 *   2. Ejecuta `analyzeHtmlSyntax` (HU-3.1 + HU-3.2) antes de enviar al backend.
 *   3. Sube el archivo al backend mediante `uploadFile` / `uploadZip`.
 *   4. Asocia los resultados del análisis con el fileId devuelto por el backend
 *      y los persiste en localStorage vía `storeAuditResult`.
 *   5. Navega automáticamente a FileReport del archivo subido.
 *
 * Los archivos CSS y ZIP se suben normalmente; el análisis WCAG local
 * no aplica para esos formatos.
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
      const isHtml = /\.html?$/i.test(file.name);

      setFiles((prev) => [
        ...prev.filter((f) => f.name !== file.name),
        { name: file.name, size: formatBytes(file.size), status: 'analyzing' },
      ]);

      try {
        // Análisis WCAG estático local (solo HTML).
        let analysisResult = null;
        if (isHtml) {
          const content = await file.text();
          analysisResult = analyzeHtmlSyntax(content);
        }

        if (isZip) {
          const data = await uploadZip(projectId, file);
          const first = data?.uploaded?.[0];
          if (first?.id && analysisResult) {
            storeAuditResult(projectId, first.id, analysisResult);
          }
          patchFile(file.name, {
            status: 'completed',
            score: analysisResult?.score ?? null,
          });
        } else {
          const data = await uploadFile(projectId, file);
          const fileId = data?.id ?? null;
          if (fileId && analysisResult) {
            storeAuditResult(projectId, fileId, analysisResult);
          }
          patchFile(file.name, {
            status: 'completed',
            score: analysisResult?.score ?? data?.score ?? null,
            fileId,
          });
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
