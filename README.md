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

