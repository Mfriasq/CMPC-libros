# 🚀 Fullstack Project: NestJS + React + PostgreSQL + Docker

Este es un proyecto completo fullstack que incluye:

- **Backend**: NestJS con TypeScript
- **Frontend**: React con TypeScript
- **Base de Datos**: PostgreSQL
- **Containerización**: Docker y Docker Compose
- **Documentación API**: Swagger/OpenAPI

## 📁 Estructura del Proyecto

```
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── users/          # Módulo de usuarios de ejemplo
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── services/       # Servicios para API
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   └── package.json
├── docker/                 # Configuraciones Docker
│   └── init.sql
├── docker-compose.yml      # Producción
├── docker-compose.dev.yml  # Desarrollo
└── README.md
```

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

1. **Clona el repositorio y navega al directorio:**

   ```bash
   cd NestJs
   ```

2. **Ejecuta todo con Docker Compose:**

   ```bash
   docker-compose up --build
   ```

3. **Accede a los servicios:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Documentación API: http://localhost:3001/api/docs
   - Adminer (DB): http://localhost:8080

### Opción 2: Desarrollo Local

#### Backend (NestJS)

1. **Navega al directorio del backend:**

   ```bash
   cd backend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   ```

4. **Inicia PostgreSQL** (puedes usar Docker):

   ```bash
   docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=nestjs_db -p 5432:5432 -d postgres:15-alpine
   ```

5. **Ejecuta el backend:**
   ```bash
   npm run start:dev
   ```

#### Frontend (React)

1. **Navega al directorio del frontend:**

   ```bash
   cd frontend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   ```

4. **Ejecuta el frontend:**
   ```bash
   npm start
   ```

## 🐳 Comandos Docker Útiles

### Desarrollo

```bash
# Ejecutar en modo desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Ver logs en tiempo real
docker-compose logs -f backend

# Acceder al contenedor del backend
docker-compose exec backend sh

# Reiniciar un servicio específico
docker-compose restart backend
```

### Producción

```bash
# Construir y ejecutar para producción
docker-compose up --build -d

# Detener todos los servicios
docker-compose down

# Eliminar volúmenes (¡cuidado! se perderán los datos)
docker-compose down -v
```

### Limpieza

```bash
# Eliminar imágenes no utilizadas
docker image prune

# Eliminar todo (contenedores, redes, volúmenes, imágenes)
docker system prune -a
```

## 📊 Base de Datos

### Conexión

- **Host**: localhost (o `database` desde dentro de Docker)
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: password
- **Base de Datos**: nestjs_db

### Gestión con Adminer

1. Accede a http://localhost:8080
2. Usa las credenciales arriba mencionadas
3. Sistema: PostgreSQL

## 🛠️ API Endpoints

### Usuarios

- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear nuevo usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Salud

- `GET /health` - Estado de la aplicación

### Documentación

- `GET /api/docs` - Swagger UI

## 🔧 Desarrollo

### Agregar Nuevas Funcionalidades

#### Backend (NestJS)

```bash
# Generar nuevo módulo
npx nest generate module nombreModulo

# Generar controlador
npx nest generate controller nombreModulo

# Generar servicio
npx nest generate service nombreModulo
```

#### Frontend (React)

```bash
# Agregar nueva dependencia
npm install nombre-paquete

# Agregar tipos de TypeScript
npm install --save-dev @types/nombre-paquete
```

### Variables de Entorno

#### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=nestjs_db
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001
```

## 🧪 Testing

### Backend

```bash
cd backend
npm run test          # Tests unitarios
npm run test:e2e      # Tests de integración
npm run test:cov      # Cobertura de código
```

### Frontend

```bash
cd frontend
npm test              # Tests con Jest
npm run test -- --coverage  # Con cobertura
```

## 📚 Tecnologías Utilizadas

### Backend

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Swagger** - Documentación de API
- **Class Validator** - Validación de datos

### Frontend

- **React** - Librería de UI
- **TypeScript** - Lenguaje de programación
- **Axios** - Cliente HTTP
- **CSS3** - Estilos

### DevOps

- **Docker** - Containerización
- **Docker Compose** - Orquestación
- **Nginx** - Servidor web (para producción del frontend)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la documentación de la API: http://localhost:3001/api/docs
2. Verifica los logs: `docker-compose logs -f`
3. Abre un issue en el repositorio

---

¡Happy coding! 🎉
