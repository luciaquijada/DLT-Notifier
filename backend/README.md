# GitHub Notifier Backend

Backend para el dashboard de control de GitHub Notifier, construido con Node.js, Express y Supabase.

## 🚀 Características

- **API RESTful** completa para gestionar usuarios, proyectos y actividades
- **Integración con Supabase** como base de datos
- **Webhooks de GitHub** para recibir eventos en tiempo real
- **Notificaciones a Slack** automáticas
- **Dashboard de actividad** con estadísticas
- **Gestión de permisos** por proyecto y usuario

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── supabase.js         # Configuración de Supabase
├── controllers/
│   ├── UserController.js   # Controlador de usuarios
│   ├── ProjectController.js # Controlador de proyectos
│   ├── ActivityController.js # Controlador de actividades
│   └── WebhookController.js # Controlador de webhooks
├── models/
│   ├── User.js            # Modelo de usuario
│   ├── Project.js         # Modelo de proyecto
│   └── Activity.js        # Modelo de actividad
├── routes/
│   ├── index.js           # Rutas principales
│   ├── users.js           # Rutas de usuarios
│   ├── projects.js        # Rutas de proyectos
│   ├── activities.js      # Rutas de actividades
│   └── webhooks.js        # Rutas de webhooks
├── services/
│   ├── GitHubWebhookService.js # Servicio de webhooks
│   └── SlackService.js    # Servicio de Slack
├── scripts/
│   ├── schema.sql         # Esquema de base de datos
│   └── migrate.js         # Script de migración
└── server.js              # Servidor principal
```

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Slack Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia la URL y las claves de tu proyecto
3. Ejecuta las migraciones:

```bash
npm run migrate
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📊 Base de Datos

### Esquema Principal

El sistema utiliza las siguientes tablas:

- **users**: Información de usuarios (GitHub + Slack)
- **projects**: Proyectos/repositorios
- **project_users**: Relación usuario-proyecto con permisos
- **activities**: Registro de actividades (PRs, pushes, etc.)
- **notifications**: Log de notificaciones enviadas

### Migración Inicial

El script de migración crea:
- Todas las tablas necesarias
- Índices para optimización
- Políticas de RLS (Row Level Security)
- Datos de ejemplo basados en tu configuración actual

## 🔗 API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `GET /api/users/:id/projects` - Proyectos del usuario

### Proyectos
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `GET /api/projects/:id/users` - Usuarios del proyecto
- `POST /api/projects/:id/users` - Añadir usuario al proyecto
- `DELETE /api/projects/:id/users/:userId` - Remover usuario
- `PUT /api/projects/:id/users/:userId` - Actualizar permisos

### Actividades
- `GET /api/activities` - Listar actividades
- `GET /api/activities/stats` - Estadísticas
- `GET /api/activities/project/:projectId` - Por proyecto
- `GET /api/activities/user/:userId` - Por usuario

### Webhooks
- `POST /webhooks/github` - Webhook de GitHub
- `POST /webhooks/test` - Webhook de prueba

## 🪝 Configuración de Webhooks

Para recibir eventos de GitHub:

1. Ve a tu repositorio → Settings → Webhooks
2. Añade una nueva webhook:
   - **Payload URL**: `https://tu-dominio.com/webhooks/github`
   - **Content Type**: `application/json`
   - **Events**: Pull requests, Pushes
3. Guarda la configuración

## 📱 Estructura de Datos

### Usuario
```json
{
  "id": "uuid",
  "github_username": "luciaquijada",
  "slack_user_id": "U092NLECWCB",
  "display_name": "Lucia Quijada",
  "avatar_url": "https://...",
  "email": "lucia@example.com",
  "is_active": true
}
```

### Proyecto
```json
{
  "id": "uuid",
  "name": "GitHub Notifier",
  "github_repo": "luciaquijada/GitHub-Notifier",
  "description": "Sistema de notificaciones",
  "emoji": "🔔",
  "image_url": "https://...",
  "is_active": true,
  "slack_webhook_url": "https://hooks.slack.com/..."
}
```

### Actividad
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "user_id": "uuid",
  "event_type": "pull_request",
  "event_data": {
    "action": "opened",
    "pr_number": 123,
    "pr_title": "Feature: New dashboard",
    "pr_url": "https://github.com/...",
    "reviewers": ["user1", "user2"]
  },
  "created_at": "2023-..."
}
```

## 🔧 Desarrollo

### Scripts disponibles

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run migrate  # Ejecutar migraciones
```

### Testing

Para probar la API puedes usar herramientas como:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code)

### Health Check

Verifica que la API esté funcionando:

```bash
curl http://localhost:3001/api/health
```

## 🚀 Próximos Pasos

Ahora que tienes el backend funcionando, puedes:

1. **Configurar Supabase** con tus credenciales
2. **Ejecutar las migraciones** para crear las tablas
3. **Probar los endpoints** con datos de ejemplo
4. **Configurar webhooks** en tus repositorios de GitHub
5. **Crear el frontend** con React

¿Listo para el siguiente paso? 🚀
