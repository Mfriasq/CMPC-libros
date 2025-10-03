# � Sistema de Gestión de Biblioteca

Un sistema completo de gestión de biblioteca construido con tecnologías modernas fullstack.

## 🚀 Tecnologías Utilizadas

### Backend

- **NestJS** - Framework progresivo de Node.js para aplicaciones server-side escalables
- **TypeScript** - Superset tipado de JavaScript
- **PostgreSQL** - Base de datos relacional robusta
- **Sequelize** - ORM para Node.js con soporte completo para TypeScript
- **JWT** - Autenticación y autorización basada en tokens
- **Multer** - Middleware para manejo de archivos multipart/form-data
- **Bcrypt** - Librería para hash de contraseñas
- **Jest** - Framework de testing con cobertura completa

### Frontend

- **React 18** - Librería de JavaScript para construir interfaces de usuario
- **TypeScript** - Tipado estático para mejor desarrollo
- **Material-UI (MUI)** - Librería de componentes React siguiendo Material Design
- **React Router Dom** - Enrutamiento declarativo para React
- **Axios** - Cliente HTTP para realizar peticiones a la API
- **React Toastify** - Notificaciones elegantes y customizables

### DevOps & Infraestructura

- **Docker** - Contenedorización de aplicaciones
- **Docker Compose** - Orquestación de servicios multi-contenedor
- **PostgreSQL Alpine** - Imagen ligera de PostgreSQL
- **Nginx** (Producción) - Servidor web y proxy reverso

## 📁 Estructura del Proyecto

```
nestjs-react-postgres-docker/
├── 📁 backend/                    # API NestJS
│   ├── 📁 src/
│   │   ├── 📁 auth/              # Módulo de autenticación
│   │   ├── 📁 users/             # Gestión de usuarios
│   │   ├── 📁 libros/            # Gestión de libros
│   │   ├── 📁 generos/           # Gestión de géneros
│   │   ├── 📁 estados/           # Estados del sistema (activo/eliminado)
│   │   └── 📁 config/            # Configuraciones
│   ├── 📁 uploads/               # Archivos subidos (imágenes de libros)
│   ├── Dockerfile                # Imagen Docker para producción
│   ├── Dockerfile.dev            # Imagen Docker para desarrollo
│   └── package.json
├── 📁 frontend/                   # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes reutilizables
│   │   ├── 📁 pages/             # Páginas de la aplicación
│   │   ├── 📁 services/          # Servicios para API calls
│   │   ├── 📁 contexts/          # Context API (auth, theme)
│   │   └── 📁 constants/         # Constantes globales
│   ├── 📁 build/                 # Build de producción
│   ├── Dockerfile                # Imagen Docker para producción
│   ├── Dockerfile.dev            # Imagen Docker para desarrollo
│   └── package.json
├── 📁 docker/                     # Configuraciones Docker
│   └── init.sql                  # Script inicial de base de datos
├── docker-compose.yml            # Orquestación para producción
├── docker-compose.dev.yml        # Orquestación para desarrollo
├── start-dev.ps1                 # Script de inicio para desarrollo
├── start-prod.ps1                # Script de inicio para producción
├── stop.ps1                      # Script para detener servicios
└── README.md                     # Este archivo
```

## 🔧 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Node.js** (versión 18 o superior) - solo para desarrollo local
- **Git** - para clonar el repositorio

### Verificar instalación:

```bash
docker --version
docker-compose --version
node --version
npm --version
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd nestjs-react-postgres-docker
```

### 2. Configuración de Variables de Entorno

El proyecto utiliza las siguientes configuraciones por defecto:

#### Backend (Puerto 3001)

- **Base de datos**: PostgreSQL en puerto 5432
- **JWT Secret**: `tu_jwt_secret_key`
- **Uploads**: Directorio `./uploads`

#### Frontend (Puerto 3000)

- **API URL**: `http://localhost:3001`

#### Base de Datos

- **Host**: `localhost` (desarrollo) / `database` (Docker)
- **Puerto**: `5432`
- **Usuario**: `postgres`
- **Contraseña**: `password`
- **Base de datos**: `biblioteca`

## 🐳 Ejecución con Docker (Recomendado)

### 🆕 **Inicio Completo desde Cero**

Para crear todo el sistema con datos iniciales desde cero:

#### Producción

```bash
# Inicia sistema completo con base de datos poblada
./start-fresh.ps1
```

#### Desarrollo

```bash
# Inicia sistema completo en modo desarrollo con hot reload
./start-fresh-dev.ps1
```

**Estos scripts incluyen:**

- ✅ Eliminación completa de contenedores y datos anteriores
- ✅ Creación de base de datos `biblioteca` desde cero
- ✅ 35 géneros literarios preconfigurados
- ✅ 110+ libros de ejemplo
- ✅ 6 usuarios con diferentes roles
- ✅ Sistema de estados (activo/eliminado)

### Inicio Estándar (Sin limpiar datos)

#### Desarrollo

```bash
# Iniciar todos los servicios en modo desarrollo
./start-dev.ps1

# O manualmente:
docker-compose -f docker-compose.dev.yml up --build
```

#### Producción

```bash
# Iniciar todos los servicios en modo producción
./start-prod.ps1

# O manualmente:
docker-compose up --build -d
```

### Detener Servicios

```bash
./stop.ps1

# O manualmente:
docker-compose down
# Para desarrollo:
docker-compose -f docker-compose.dev.yml down
```

## 💻 Desarrollo Local (Sin Docker)

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Base de Datos

```bash
# Iniciar solo PostgreSQL con Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=biblioteca -p 5432:5432 -d postgres:15-alpine
```

### 3. Ejecutar en Modo Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm start
```

## 🌐 URLs de Acceso

Una vez iniciado el proyecto:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentación API (Swagger)**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432

## 👤 Usuarios por Defecto

El sistema incluye usuarios predefinidos:

### Administrador

- **Email**: `admin@biblioteca.com`
- **Contraseña**: `admin123`
- **Rol**: `ADMIN`
- **Permisos**: Acceso completo al sistema

### Bibliotecario

- **Email**: `librarian@biblioteca.com`
- **Contraseña**: `librarian123`
- **Rol**: `LIBRARIAN`
- **Permisos**: Gestión de libros y géneros

### Usuario Regular

- **Email**: `user@biblioteca.com`
- **Contraseña**: `user123`
- **Rol**: `USER`
- **Permisos**: Consulta de libros únicamente

## 📖 Guía de Uso

### 🔐 Autenticación

1. **Registro**: Crear nueva cuenta (rol USER por defecto)
2. **Login**: Acceder con email y contraseña
3. **Dashboard**: Interfaz personalizada según rol de usuario

### 📚 Gestión de Libros (Admin/Librarian)

#### Crear Libro

1. Navegar a "Libros" → "Agregar Libro"
2. Completar formulario:
   - Título, Autor, Editorial
   - Género (seleccionar de lista)
   - Precio (formato chileno CLP)
   - Disponibilidad (cantidad en stock)
   - Imagen (opcional, JPG/PNG máx 5MB)
3. Guardar

#### Buscar y Filtrar

- **Búsqueda por texto**: Título o autor (con debounce)
- **Filtros avanzados**: Género, rango de precios
- **Paginación**: Navegación por páginas de resultados
- **Exportar CSV**: Descargar resultados filtrados

#### Editar/Eliminar

- **Editar**: Clic en tarjeta de libro → formulario de edición
- **Eliminar**: Soft delete (mantiene datos, cambia estado)
- **Restaurar**: Recuperar libros eliminados

### 👥 Gestión de Usuarios (Solo Admin)

#### Administrar Usuarios

1. Navegar a "Usuarios"
2. Ver lista con información: nombre, email, rol, estado
3. Acciones disponibles:
   - Editar información de usuario
   - Cambiar rol (USER/LIBRARIAN/ADMIN)
   - Eliminar usuario (soft delete)
   - Restaurar usuario eliminado
   - Buscar por nombre o email

### 📊 Exportación de Datos

#### CSV de Libros

1. Ir a "Libros"
2. Aplicar filtros deseados
3. Clic en "Exportar CSV"
4. Descarga automática del archivo

**Contenido del CSV**:

- ID, Título, Autor, Editorial
- Género, Precio, Disponibilidad
- Estado, Fechas de creación/modificación

## 🏗️ Arquitectura del Sistema

### Backend (NestJS)

#### Patrón de Arquitectura

- **Modular**: Cada funcionalidad en módulos independientes
- **Inyección de Dependencias**: Gestión automática con decoradores
- **Interceptores y Middlewares**: Para logging, validación y manejo de errores
- **Guards**: Protección de rutas con JWT y roles

#### Estructura de Módulos

```
auth/                   # Autenticación y autorización
├── auth.controller.ts  # Endpoints: /auth/login, /auth/register
├── auth.service.ts     # Lógica de negocio JWT
├── jwt.strategy.ts     # Estrategia de validación JWT
├── jwt-auth.guard.ts   # Guard de autenticación
└── roles.guard.ts      # Guard de autorización por roles

users/                  # Gestión de usuarios
├── users.controller.ts # CRUD de usuarios (solo admin)
├── users.service.ts    # Lógica de negocio de usuarios
├── user.model.ts       # Modelo Sequelize
└── dto/                # Data Transfer Objects

libros/                 # Gestión de libros
├── libros.controller.ts # CRUD de libros + búsqueda + CSV
├── libros.service.ts    # Lógica compleja (filtros, paginación)
├── libro.model.ts       # Modelo con relaciones
├── multer-config.ts     # Configuración de subida de archivos
└── dto/                 # DTOs para validación

estados/                # Sistema de estados centralizados
├── estados.service.ts   # Manejo de estados (activo/eliminado)
└── estado.model.ts      # Modelo de estados

generos/                # Catálogo de géneros literarios
├── generos.controller.ts
├── generos.service.ts
└── genero.model.ts
```

#### Base de Datos

**Diseño Relacional**:

```sql
Estados (id, nombre)           # activo, eliminado
├── Users (id, name, email, password, role, estadoId)
├── Libros (id, titulo, autor, editorial, precio, generoId, estadoId)
└── Generos (id, nombre, descripcion)
```

**Características**:

- **Foreign Keys**: Relaciones estrictas entre tablas
- **Soft Delete**: Eliminación lógica preservando datos
- **Timestamps**: Auditoría automática (createdAt, updatedAt)
- **Índices**: Optimización para búsquedas por título/autor

### Frontend (React)

#### Arquitectura de Componentes

```
src/
├── components/           # Componentes reutilizables
│   ├── LibroCard.tsx    # Tarjeta de libro con acciones
│   ├── UserCard.tsx     # Tarjeta de usuario
│   └── ProtectedRoute.tsx # HOC para protección de rutas
├── pages/                # Páginas de la aplicación
│   ├── Login.tsx        # Página de autenticación
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Libros.tsx       # Gestión completa de libros
│   └── Users.tsx        # Gestión de usuarios (admin)
├── services/             # Capa de servicios
│   ├── api.ts           # Cliente axios configurado
│   ├── authService.ts   # Servicios de autenticación
│   ├── librosService.ts # Servicios de libros
│   └── usersService.ts  # Servicios de usuarios
├── contexts/             # Estado global
│   ├── AuthContext.tsx  # Contexto de autenticación
│   └── ThemeContext.tsx # Contexto de tema
└── constants/            # Constantes y tipos
    └── UserRoles.ts      # Enum de roles de usuario
```

#### Patrones de Diseño

- **Context API**: Estado global de autenticación
- **Custom Hooks**: Lógica reutilizable (useAuth, useApi)
- **Compound Components**: Componentes complejos modulares
- **Render Props**: Componentes flexibles y reutilizables

#### Manejo de Estado

- **Local State**: useState para estados de componente
- **Global State**: Context API para autenticación
- **Server State**: Axios con intercepción de errores
- **Form State**: Formularios controlados con validación

## 🧪 Testing

### Backend Testing (Jest)

#### Cobertura Completa

- **Controllers**: Tests de endpoints y validaciones
- **Services**: Tests de lógica de negocio y casos edge
- **Guards**: Tests de autenticación y autorización
- **Mocking**: Sequelize models y servicios externos

```bash
# Ejecutar todos los tests
cd backend
npm test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests específicos
npm test -- users.service.spec.ts
```

#### Estadísticas Actuales

- **62 tests** pasando al 100%
- **6 archivos de test** cubriendo todos los módulos principales
- **Cobertura**: Controladores, servicios y guards

### Archivos de Test

```
src/
├── auth/
│   ├── auth.controller.spec.ts  # 13 tests
│   └── auth.service.spec.ts     # 6 tests
├── users/
│   ├── users.controller.spec.ts # 13 tests
│   └── users.service.spec.ts    # 14 tests
└── libros/
    ├── libros.controller.spec.ts # 15 tests
    └── libros.service.spec.ts    # 15 tests
```

## 🔒 Seguridad

### Medidas Implementadas

#### Autenticación

- **JWT Tokens**: Tiempo de vida configurable
- **Hash de Contraseñas**: Bcrypt con salt rounds
- **Validación de Email**: Formato y unicidad

#### Autorización

- **Role-Based Access Control (RBAC)**: Tres niveles de permisos
- **Route Protection**: Guards en endpoints sensibles
- **Data Isolation**: Usuarios solo acceden a sus datos

#### Validación

- **DTOs**: Validación de entrada con class-validator
- **Sanitización**: Limpieza de datos de entrada
- **File Upload**: Validación de tipo y tamaño de archivos

#### Seguridad de Aplicación

- **CORS**: Configurado para origenes específicos
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **SQL Injection**: Prevención con Sequelize ORM

## 🚀 Deployment

### Entornos Disponibles

#### Desarrollo

```bash
./start-dev.ps1
# - Hot reload activado
# - Debugging habilitado
# - Volúmenes para desarrollo
# - Puerto 3000 (React) + 3001 (NestJS)
```

#### Producción

```bash
./start-prod.ps1
# - Builds optimizados
# - Nginx como proxy reverso
# - Volúmenes persistentes
# - SSL/TLS ready (configuración externa)
```

### Configuración para Cloud

#### Variables de Entorno para Producción

```env
# Backend
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret
DB_HOST=your_postgres_host
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=biblioteca

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

#### Docker Registry

```bash
# Construir imágenes
docker build -t your-registry/biblioteca-backend ./backend
docker build -t your-registry/biblioteca-frontend ./frontend

# Subir a registry
docker push your-registry/biblioteca-backend
docker push your-registry/biblioteca-frontend
```

## 🔧 Comandos Útiles

### Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Logs de servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Acceder a contenedor
docker exec -it nestjs_backend bash
docker exec -it nestjs_postgres psql -U postgres -d biblioteca

# Limpiar sistema Docker
docker system prune -f
docker-compose down -v  # Elimina volúmenes
```

### Base de Datos

```bash
# Backup de base de datos
docker exec nestjs_postgres pg_dump -U postgres biblioteca > backup.sql

# Restaurar backup
docker exec -i nestjs_postgres psql -U postgres biblioteca < backup.sql

# Ver tablas
docker exec nestjs_postgres psql -U postgres -d biblioteca -c "\dt"

# Ejecutar query
docker exec nestjs_postgres psql -U postgres -d biblioteca -c "SELECT * FROM users;"
```

### Desarrollo

```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar tests de ambos proyectos
npm run test:backend
npm run test:frontend

# Builds de producción
npm run build:backend
npm run build:frontend
```

### Estándares de Código

- **TypeScript**: Tipado estricto habilitado
- **ESLint**: Configuración estándar de NestJS/React
- **Prettier**: Formato automático de código
- **Commits**: Conventional commits recomendados

### Testing

- **Cobertura mínima**: 80% para nuevas funcionalidades
- **Tests unitarios**: Obligatorios para servicios y controladores
- **Tests de integración**: Recomendados para flujos complejos

## 🆘 Soporte y Troubleshooting

### Problemas Comunes

#### Puerto ya en uso

```bash
# Verificar puertos ocupados
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Detener procesos
docker-compose down
# o matar proceso específico
taskkill /PID <PID> /F
```

#### Error de conexión a base de datos

```bash
# Verificar estado de PostgreSQL
docker ps | grep postgres

# Reiniciar solo la base de datos
docker-compose restart database

# Verificar logs de base de datos
docker-compose logs database
```

#### Problemas de permisos de archivos

```bash
# Windows: Ejecutar PowerShell como administrador
# Linux/Mac: Verificar permisos de directorio uploads/
chmod -R 755 ./backend/uploads
```
