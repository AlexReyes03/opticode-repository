# Prototipos UI — Plataforma de Auditoría de Accesibilidad WCAG

Prototipos visuales generados para todas las historias de usuario, con estilo profesional y paleta de tonalidades azules (navy `#1a2b5e`, royal blue `#2563eb`, sky blue `#60a5fa`).

---

## Épica 1: Autenticación y Gestión de Usuarios

### OC-1.1 — Registro de Desarrolladores

Formulario de registro con campos para nombre, correo, contraseña y confirmación. Incluye indicadores de política de seguridad de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número). Panel decorativo lateral con branding de la plataforma.

![Registro de Desarrolladores](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_1_1_registro_1773335191442.png)

---

### OC-1.2 — Inicio de Sesión

Pantalla de login con campos de correo y contraseña, enlace a recuperación de contraseña, y opción para navegar al registro. Mensaje de error genérico: *"Credenciales de acceso incorrectas"* (no revela si el fallo fue por correo o contraseña).

![Inicio de Sesión](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_1_2_login_1773335207485.png)

---

### OC-1.3 — Administración de Cuentas

Panel de administración con tabla de usuarios registrados. Columnas: nombre, correo, fecha de registro, estado (Activo/Suspendido), y acciones (Suspender/Eliminar). Accesible únicamente para perfiles de Administrador. La eliminación es lógica (el usuario no puede volver a iniciar sesión).

![Panel de Administración](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_1_3_admin_panel_1773335219862.png)

---

### OC-1.4a — Recuperación de Contraseña (Solicitud)

Pantalla para solicitar el restablecimiento de contraseña. Mensaje genérico al enviar: *"Si el correo existe, recibirás instrucciones"* para evitar escaneo de cuentas.

![Recuperar Contraseña - Solicitud](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_1_4a_recuperar_1773335234292.png)

---

### OC-1.4b — Recuperación de Contraseña (Restablecer)

Formulario accesible desde el enlace temporal enviado por correo (expira a los 30 minutos). Campos para nueva contraseña y confirmación, con validación visual de la política de seguridad.

![Restablecer Contraseña](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_1_4b_restablecer_1773335251133.png)

---

## Épica 2: Organización de Proyectos y Suministro de Archivos

### OC-2.1 — Dashboard de Proyectos

Vista principal del desarrollador con sus proyectos en formato de tarjetas. Cada tarjeta muestra nombre, descripción, cantidad de archivos y fecha. Botón prominente para crear nuevo proyecto.

![Dashboard de Proyectos](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_2_1_dashboard_proyectos_1773335288970.png)

---

### OC-2.1 — Crear Proyecto (Modal)

Modal para creación de proyecto con campo obligatorio de nombre (máx. 100 caracteres) y descripción opcional.

![Crear Proyecto](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_2_1_crear_proyecto_1773335306055.png)

---

### OC-2.2 / 2.3 / 2.4 — Carga de Archivos

Área de carga con dos zonas de arrastrar y soltar: archivo individual (HTML/CSS, 1KB-10MB) y carga en lote (ZIP, máx. 50 archivos, 50MB). Lista inferior muestra archivos subidos con estado de análisis. Archivos duplicados reemplazan la evaluación anterior.

![Carga de Archivos](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_2_2_carga_archivos_1773335319012.png)

---

## Épica 3 + 4: Motor de Reglas y Dashboard de Resultados

### OC-4.1 — Tablero de Control del Proyecto

Lista de archivos auditados con sistema de semáforo: **Verde** (90-100), **Naranja** (50-89), **Rojo** (0-49). Muestra contadores de faltas críticas y advertencias por archivo, ordenados cronológicamente.

![Tablero de Control](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_4_1_tablero_proyecto_1773335356638.png)

---

### OC-4.2 / 3.6 — Resumen Ejecutivo del Archivo

Reporte con gráfico circular de calificación (0-100), contadores de gravedad (X roja para críticas, ! amarillo para advertencias), y desglose por categoría de regla. **Disclaimer permanente** en la cabecera sobre las limitaciones del análisis estático (OC-4.5).

> Scoring: 100 puntos iniciales − 10 por Falta Crítica − 5 por Advertencia. Mínimo 0.

![Resumen Ejecutivo](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_4_2_resumen_archivo_1773335371804.png)

---

### OC-4.3 / 4.4 / 4.5 — Detalle de Errores, Filtrado y Disclaimer

Lista detallada de errores con contexto visual de código (3 líneas: anterior, error resaltado, posterior). Filtrado en cliente: "Todos", "Solo Críticos", "Solo Advertencias". Cada error muestra severidad, regla WCAG violada, número de línea y fragmento de código sanitizado.

![Detalle de Errores](C:\Users\dsanc\.gemini\antigravity\brain\2080515b-604e-447e-bcbe-f9503618723d\oc_4_3_detalle_errores_1773335389187.png)

---

## Mapeo de Pantallas a Historias de Usuario

| Pantalla | Historias cubiertas |
|---|---|
| Registro | OC-1.1 |
| Login | OC-1.2 |
| Panel Admin | OC-1.3 |
| Recuperar Contraseña (Solicitud) | OC-1.4 |
| Restablecer Contraseña | OC-1.4 |
| Dashboard de Proyectos | OC-2.1 |
| Modal Crear Proyecto | OC-2.1 |
| Carga de Archivos | OC-2.2, OC-2.3, OC-2.4 |
| Tablero de Control | OC-4.1 |
| Resumen Ejecutivo | OC-3.6, OC-4.2, OC-4.5 |
| Detalle de Errores | OC-3.1 a OC-3.5, OC-4.3, OC-4.4 |
