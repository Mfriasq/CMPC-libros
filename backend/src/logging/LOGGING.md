# Sistema de Logging y Auditoría

## Descripción

Este sistema proporciona logging estructurado y auditoría completa para todas las operaciones CRUD y eventos de seguridad del sistema de gestión de biblioteca.

## Características Implementadas

### 📊 **Logging Estructurado con Winston**

- Logs estructurados en formato JSON
- Rotación automática de archivos por día
- Diferentes niveles de log (error, warn, info, debug)
- Retención configurable por tipo de log

### 🔍 **Auditoría Completa**

- Tracking de todas las operaciones CRUD
- Registro de eventos de autenticación y autorización
- Logging de accesos a datos sensibles
- Trazabilidad completa de cambios en el sistema

### 🛡️ **Seguridad y Compliance**

- Logs de eventos de seguridad
- Detección de patrones sospechosos
- Tracking de intentos de acceso no autorizado
- Sanitización de datos sensibles en logs

### 📈 **Reportes y Analytics**

- Reportes de auditoría con filtros avanzados
- Estadísticas de uso del sistema
- Análisis de patrones de actividad
- Detección automática de actividades sospechosas

## Archivos de Log Generados

### `/logs/application-YYYY-MM-DD.log`

Logs generales de la aplicación (rotación diaria, 30 días de retención)

### `/logs/audit-YYYY-MM-DD.log`

Logs específicos de auditoría (rotación diaria, 90 días de retención)

### `/logs/error-YYYY-MM-DD.log`

Logs de errores críticos (rotación diaria, 30 días de retención)

### `/logs/security-YYYY-MM-DD.log`

Logs de eventos de seguridad (rotación diaria, 365 días de retención)

### `/logs/exceptions.log`

Excepciones no capturadas del sistema

### `/logs/rejections.log`

Promesas rechazadas no manejadas

## Eventos de Auditoría Registrados

### 🔐 **Autenticación (AUTH)**

- `LOGIN_SUCCESS` - Login exitoso
- `LOGIN_FAILURE` - Intento fallido de login
- `LOGOUT` - Cierre de sesión
- `TOKEN_VALIDATION` - Validación de tokens JWT

### 👥 **Gestión de Usuarios (USER_MANAGEMENT)**

- `CREATE_USER_SUCCESS/FAILURE` - Creación de usuarios
- `UPDATE_USER_SUCCESS/FAILURE` - Actualización de usuarios
- `DELETE_USER_SUCCESS/FAILURE` - Eliminación de usuarios
- `RESTORE_USER_SUCCESS/FAILURE` - Restauración de usuarios

### 📚 **Gestión de Libros (BOOK_MANAGEMENT)**

- `CREATE_BOOK_SUCCESS/FAILURE` - Creación de libros
- `UPDATE_BOOK_SUCCESS/FAILURE` - Actualización de libros
- `DELETE_BOOK_SUCCESS/FAILURE` - Eliminación de libros
- `UPLOAD_BOOK_IMAGE` - Subida de imágenes

### 🏷️ **Gestión de Géneros (GENRE_MANAGEMENT)**

- `CREATE_GENRE_SUCCESS/FAILURE` - Creación de géneros
- `UPDATE_GENRE_SUCCESS/FAILURE` - Actualización de géneros
- `DELETE_GENRE_SUCCESS/FAILURE` - Eliminación de géneros

### 📊 **Acceso a Datos (DATA_ACCESS)**

- `ACCESS_BOOKS` - Consulta de libros
- `SEARCH_BOOKS` - Búsqueda de libros
- `ACCESS_USERS` - Consulta de usuarios
- `ACCESS_GENRES` - Consulta de géneros
- `EXPORT_CSV` - Exportación de datos

### 🛡️ **Seguridad (SECURITY)**

- `FAILED_LOGIN_ATTEMPT` - Intentos fallidos de login
- `UNAUTHORIZED_ACCESS` - Accesos no autorizados
- `SUSPICIOUS_ACTIVITY` - Actividad sospechosa detectada
- `SECURITY_ERROR` - Errores relacionados con seguridad

## Información Registrada por Evento

Cada evento de auditoría incluye:

```json
{
  "timestamp": "2025-10-05T14:30:00.000Z",
  "level": "info",
  "category": "BOOK_MANAGEMENT",
  "action": "CREATE_BOOK_SUCCESS",
  "userId": 123,
  "userEmail": "librarian@biblioteca.com",
  "userRole": "librarian",
  "resourceId": 456,
  "resourceType": "Book",
  "success": true,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "bookTitle": "1984",
    "bookAuthor": "George Orwell",
    "bookGenre": 5
  },
  "duration": 150,
  "metadata": {
    "method": "POST",
    "url": "/api/libros",
    "correlationId": "req_1728140400000_abc123"
  }
}
```

## API Endpoints de Auditoría

### `GET /audit/reports`

Generar reporte de auditoría con filtros

- **Query Parameters:** startDate, endDate, userId, category, action, success
- **Acceso:** Solo administradores

### `GET /audit/user-activity/:userId`

Reporte de actividad de usuario específico

- **Query Parameters:** days (default: 30)
- **Acceso:** Solo administradores

### `GET /audit/security`

Reporte de eventos de seguridad

- **Query Parameters:** hours (default: 24)
- **Acceso:** Solo administradores

### `GET /audit/statistics`

Estadísticas de uso del sistema

- **Query Parameters:** days (default: 7)
- **Acceso:** Solo administradores

### `GET /audit/suspicious-activity`

Detección de actividad sospechosa

- **Acceso:** Solo administradores

### `GET /audit/system-health`

Métricas de salud del sistema de logging

- **Acceso:** Solo administradores

## Patrones de Actividad Sospechosa Detectados

### 🚨 **Múltiples Fallos de Login (HIGH)**

- 5+ intentos fallidos desde la misma IP en 24h
- Posible ataque de fuerza bruta

### ⏰ **Actividad Fuera de Horario (MEDIUM)**

- 10+ operaciones entre 2 AM - 6 AM
- Actividad inusual en horarios no laborales

### 📊 **Alta Tasa de Error por Usuario (MEDIUM)**

- Usuario con 50%+ de operaciones fallidas
- Posible compromiso de cuenta o comportamiento anómalo

## Configuración

### Variables de Entorno

```env
# Nivel de logging (error, warn, info, debug)
LOG_LEVEL=info

# Directorio de logs (relativo a la aplicación)
LOGS_DIR=./logs

# Retención de archivos de log (días)
LOG_RETENTION_DAYS=30
AUDIT_RETENTION_DAYS=90
SECURITY_RETENTION_DAYS=365
```

### Configuración en Código

```typescript
// logger.config.ts
export const loggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    // Configuraciones de transporte
  ],
};
```

## Uso en Controladores

### Logging Manual con Decoradores

```typescript
@Controller("libros")
export class LibrosController {
  @Post()
  @AuditBookManagement("CREATE_BOOK")
  async create(@Body() dto: CreateLibroDto, @Request() req: any) {
    // El interceptor captura automáticamente el evento
    return this.librosService.create(dto);
  }
}
```

### Logging Programático

```typescript
// En cualquier servicio
constructor(private readonly loggingService: LoggingService) {}

async someMethod() {
  // Log de auditoría manual
  this.loggingService.auditBookManagement(
    'CUSTOM_BOOK_OPERATION',
    userId,
    userEmail,
    userRole,
    bookId,
    true, // success
    { customData: 'value' },
    request
  );

  // Log de cambios en datos
  this.loggingService.logDataChange(
    'UPDATE',
    'Book',
    bookId,
    oldData,
    newData,
    userId,
    userEmail,
    request
  );
}
```

## Beneficios para Compliance

### ✅ **Trazabilidad Completa**

- Registro de quién, qué, cuándo y desde dónde
- Cadena completa de custodia de datos
- Tracking de cambios con datos antes/después

### ✅ **Retención Configurable**

- Diferentes períodos según criticidad
- Compresión automática para optimizar espacio
- Archivado automático con rotación

### ✅ **Seguridad y Integridad**

- Logs estructurados inmutables
- Sanitización automática de datos sensibles
- Detección proactiva de amenazas

### ✅ **Reportes Ejecutivos**

- Dashboards de actividad del sistema
- Métricas de uso y rendimiento
- Alertas automáticas de seguridad

## Monitoreo y Alertas

### Métricas Clave

- Volumen total de operaciones
- Tasa de éxito/fallo por categoría
- Usuarios más activos
- Patrones de uso por horario
- Eventos de seguridad críticos

### Alertas Automáticas

- Detección de patrones sospechosos
- Errores críticos del sistema
- Picos inusuales de actividad
- Fallos de autenticación masivos

Este sistema proporciona una base sólida para cumplir con requerimientos de auditoría, compliance y seguridad en entornos empresariales.
