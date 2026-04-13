# Estado de Implementacion — OPTICODE

Referencia cruzada entre historias de usuario, backend y frontend.
Actualizado: 2026-04-11

---

## Resumen ejecutivo

- El flujo principal de proyectos, subida de archivos y auditoria WCAG ya esta conectado de extremo a extremo.
- Existen avances significativos que no estaban reflejados en la version anterior de este documento.
- Los pendientes mas importantes estan en integracion frontend de algunos endpoints, alineacion de contratos y reglas WCAG faltantes.

---

## Epica 1 — Autenticacion y Gestion de Usuarios

| Historia | Descripcion | Backend | Frontend | Estado |
|---|---|---|---|---|
| OC-1.1 | Registro de desarrolladores | ✅ `POST /api/auth/register/` | ✅ `Register.jsx` | **Completo** |
| OC-1.2 | Inicio de sesion con JWT | ✅ `POST /api/auth/login/` | ✅ `Login.jsx` + `AuthContext` | **Completo** |
| OC-1.2 | Refresco automatico de token | ✅ `POST /api/auth/token/refresh/` | ⚠️ `fetch-wrapper.js` usa `/api/token/refresh/` | **Parcial — desalineado** |
| OC-1.2 | Datos del usuario autenticado | ✅ `GET /api/auth/me/` | ✅ `AuthContext` + `UserProfile` consumen datos reales | **Completo** |
| OC-1.3 | Listar usuarios (admin) | ✅ `GET /api/users/` | ✅ `AdminDashboard.jsx` | **Completo** |
| OC-1.3 | Suspender usuario (admin) | ✅ `PATCH /api/users/:id/suspend/` | ⚠️ `admin-services.js` envia `POST` | **Parcial — desalineado** |
| OC-1.3 | Eliminar usuario (admin) | ❌ Sin endpoint | ⚠️ Boton visible sin handler en `UserTable.jsx` | **Pendiente** |
| OC-1.4 | Solicitar recuperacion de contrasena | ✅ `POST /api/auth/forgot-password/` | ✅ `ForgotPassword.jsx` conectado | **Completo** |
| OC-1.4 | Restablecer contrasena | ✅ `POST /api/auth/reset-password/` | ⚠️ `ResetPassword.jsx` sigue en placeholder + URL incorrecta en `auth-services.js` | **Parcial** |
| OC-1.5 | Cambiar contrasena autenticado | ✅ `POST /api/auth/change-password/` | ⚠️ Boton "Cambiar" en perfil sin flujo conectado | **Parcial** |

---

## Epica 2 — Organizacion de Proyectos y Suministro de Archivos

| Historia | Descripcion | Backend | Frontend | Estado |
|---|---|---|---|---|
| OC-2.1 | Crear proyecto | ✅ `POST /api/projects/` | ✅ `CreateProjectModal.jsx` envia `{name, description}` correctamente | **Completo** |
| OC-2.1 | Listar proyectos del usuario | ✅ `GET /api/projects/` | ✅ `UserDashboard.jsx` | **Completo** |
| OC-2.1 | Edicion de proyecto (nombre/descripcion) | ✅ `PATCH /api/projects/:id/` | ✅ `ProjectDashboard.jsx` (edicion inline) | **Completo** |
| OC-2.1 | Eliminar proyecto | ✅ `DELETE /api/projects/:id/` | ✅ `UserDashboard.jsx` | **Completo** |
| OC-2.2 | Subir archivo individual (HTML/CSS) | ✅ `POST /api/projects/:id/files/upload/` | ✅ `useFileUpload.js` + `DropZone` | **Completo** |
| OC-2.3 | Subir lote ZIP | ✅ `POST /api/projects/:id/files/upload-zip/` | ✅ `useFileUpload.js` + `DropZone` | **Completo** |
| OC-2.4 | Reemplazar archivo duplicado | ✅ overwrite por `(project, filename)` | ✅ mismo flujo de upload | **Completo** |
| OC-2.5 | Listado de archivos del proyecto | ✅ `GET /api/projects/:id/files/` | ✅ `ProjectDashboard.jsx` consume datos reales | **Completo** |
| OC-2.6 | Eliminar archivo del proyecto | ✅ `DELETE /api/projects/:id/files/:fileId/` | ✅ boton "Eliminar" en `ProjectDashboard.jsx` | **Completo** |
| OC-2.7 | Exportar proyecto a Excel | ✅ `GET /api/projects/:id/export/` | ⚠️ sin boton/accion en UI | **Backend listo, falta UI** |

---

## Epica 3 — Motor de Reglas WCAG

| Historia | Descripcion | Backend | Frontend | Estado |
|---|---|---|---|---|
| OC-3.1 | Arquitectura del motor de auditoria | ✅ `engine.py` + `rules/` | — | **Completo** |
| OC-3.x | Conexion upload -> `run_audit()` | ✅ en `FileUploadView` y `ZipUploadView` | ✅ vistas consumen resultados | **Completo** |
| OC-3.x | Registro de reglas por tipo de archivo | ✅ `rules/__init__.py` + `HTML_RULES/CSS_RULES` | — | **Completo** |
| OC-3.2 | Regla: jerarquia de encabezados (WCAG 2.4.6) | ✅ `rules/headings.py` | — | **Completo** |
| OC-3.4 | Regla: inputs sin label accesible (WCAG 1.3.1) | ✅ `rules/forms.py` | — | **Completo** |
| OC-3.x | Regla: contraste de color CSS (WCAG 1.4.3) | ✅ `rules/contrast.py` | — | **Completo** |
| OC-3.6 | Formula de scoring | ✅ `100 - 10*criticas - 5*advertencias` | ✅ `FileReport.jsx` lo muestra | **Completo** |
| OC-3.x | Snippet de 3 lineas de contexto | ✅ reglas generan `code_snippet` multilinea | ✅ `ErrorDetail.jsx` lo interpreta | **Completo** |

### Reglas pendientes por implementar

- OC-3.2: `<img>` sin `alt` (WCAG 1.1.1).
- OC-3.3: `<html>` sin atributo `lang` (WCAG 3.1.1).
- Criterio OC-3.5 por definir/consensuar en backlog tecnico.

---

## Epica 4 — Dashboard de Resultados y Reportes

| Historia | Descripcion | Backend | Frontend | Estado |
|---|---|---|---|---|
| OC-4.1 | Tablero por archivo (semáforo + puntaje) | ✅ `GET /api/projects/:id/files/` con `score`, `critical_count`, `warning_count` | ✅ `ProjectDashboard.jsx` | **Completo** |
| OC-4.2 | Resumen ejecutivo por archivo | ✅ `GET /api/audit/:fileId/report/` | ✅ `FileReport.jsx` | **Completo** |
| OC-4.3 | Detalle de hallazgos | ✅ `GET /api/audit/:fileId/findings/` | ✅ `ErrorDetail.jsx` | **Completo** |
| OC-4.4 | Filtrado por severidad | — | ✅ `ErrorFilter.jsx` + `ErrorDetail.jsx` | **Completo** |
| OC-4.5 | Disclaimer de analisis estatico | — | ✅ `FileReport.jsx` | **Completo** |
| OC-4.6 | KPIs globales del dashboard | ✅ `GET /api/audit/kpis/` | ⚠️ sin consumo en vistas actuales | **Backend listo, falta UI** |
| OC-4.7 | Exportar reporte a PDF | ✅ `GET /api/audit/:fileId/report/pdf/` | ⚠️ sin boton/flujo en UI | **Backend listo, falta UI** |

---

## Bloqueadores y prioridades actuales

1. **Alinear contratos de autenticacion en frontend**:
   - `fetch-wrapper.js` debe usar `/api/auth/token/refresh/`.
   - `auth-services.js` debe usar `/api/auth/reset-password/`.
   - `ResetPassword.jsx` debe dejar de usar placeholder y llamar al API real.
2. **Corregir suspension de usuarios en frontend admin**:
   - cambiar `POST` por `PATCH` para `/api/users/:id/suspend/`.
3. **Definir e implementar eliminacion de usuario en admin**:
   - endpoint backend + handler en `UserTable.jsx`.
4. **Implementar reglas WCAG faltantes**:
   - imagen sin `alt`,
   - documento sin `lang`.
5. **Cerrar brecha de valor en UI de reportes**:
   - consumir KPIs en dashboard,
   - agregar acciones de exportacion a Excel/PDF.

---

## Contratos de API pendientes o desalineados

```text
Frontend usa hoy:
- POST /api/token/refresh/            (debe ser /api/auth/token/refresh/)
- POST /api/reset-password/           (debe ser /api/auth/reset-password/)
- POST /api/users/:id/suspend/        (backend espera PATCH)
```

El resto de contratos principales para proyectos/auditoria ya se encuentran implementados y conectados.
