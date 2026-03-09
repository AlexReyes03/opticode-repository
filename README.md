# OPTICODE - Plataforma de Análisis de Métricas WGAC Para Accesibilidad Web

**Autor:** StackFlow - ACK

Plataforma de análisis de métricas WGAC para accesibilidad web, que permite a los usuarios evaluar la accesibilidad de sus sitios web y obtener recomendaciones para mejorarla.

## Características

- Análisis de métricas WGAC
- Evaluación de accesibilidad web
- Recomendaciones para mejorar la accesibilidad


## BACKEND

### Tecnologías

- Python
- Django
- Django REST Framework
- MySQL

### Instalación

```bash
cd opticode_backend
pip install -r requirements.txt
```

### Configuración de la base de datos MySQL

Crea la base de datos en tu servidor MySQL:"

```sql
CREATE DATABASE opticode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Configuración de .env

Consultar el .env.example y llenar los campos

```env
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourhosts (local or 127.0.0.1)

DB_NAME=opticode_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=3306
```

### Uso

```bash
python manage.py runserver
```


## FRONTEND

### Tecnologías

- React
- Vite
- Bootstrap
- JavaScript

### Instalación

```bash
cd opticode_frontend
npm install
npm run dev
```

### Uso

```bash
npm run dev
```

## Guía de Contribución

### Flujo de Trabajo (Trunk-Based Development)

Este proyecto utiliza la metodología **Trunk-Based Development**. Todas las ramas de características deben ser de corta duración y fusionarse (*merge*) directamente a la rama principal a través de Pull Requests (PRs) de manera continua y frecuente.

Para enviar un PR, siga estas directrices:
1. Asegúrese de mantener su rama local actualizada respecto a la rama principal.
2. Cree una rama efímera para su desarrollo a partir de la rama principal.
3. Verifique que sus cambios cumplan con los criterios de calidad y no introduzcan regresiones.
4. Abra el PR hacia la rama principal proporcionando una descripción clara del valor aportado o el problema resuelto.

### Convención de Commits

Para mantener el historial del proyecto limpio y automatizable, es obligatorio utilizar la siguiente nomenclatura basada en *Conventional Commits*:

| Tipo | Uso | Ejemplo |
| :--- | :--- | :--- |
| **feat** | Introducción de una nueva funcionalidad. | `feat(api): add user profile endpoint` |
| **fix** | Corrección de un error o *bug*. | `fix(ui): resolve button alignment issue` |
| **chore** | Tareas de mantenimiento, actualización de dependencias o herramientas (sin cambios en código de producción). | `chore: update dependencies` |
| **refactor** | Modificaciones en el código que no alteran el comportamiento externo ni corrigen errores, pero mejoran la estructura o limpieza. | `refactor: simplify validation logic` |
| **docs** | Modificaciones exclusivas en la documentación (README, comentarios). | `docs: update installation guide` |
| **style** | Cambios de formato (espacios, punto y coma) que no interfieren con la lógica del código. | `style: run prettier on all files` |
| **test** | Creación o modificación de pruebas unitarias/integración. | `test: add cases for edge-case login` |
| **perf** | Optimizaciones en el código para mejorar el rendimiento. | `perf: optimize database query` |
| **ci** | Cambios en la configuración de CI/CD (scripts, *pipelines* de GitHub Actions, Vercel, etc.). | `ci: add github action for linting` |
