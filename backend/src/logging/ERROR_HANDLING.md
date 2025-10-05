# Sistema de Manejo de Errores Centralizado

## 🎯 Descripción

Sistema comprehensivo de manejo de errores que estandariza todas las respuestas de error y éxito en la aplicación NestJS, eliminando la necesidad de try/catch dispersos y mejorando la experiencia del desarrollador y usuario.

## 🏗️ Arquitectura del Sistema

### Componentes Principales:

1. **GlobalExceptionFilter** - Filtro global que captura todas las excepciones
2. **ResponseTransformInterceptor** - Interceptor que estandariza respuestas exitosas
3. **Custom Error Classes** - Clases de error específicas para diferentes escenarios
4. **Error Helper** - Utilidades para lanzar errores de manera consistente
5. **Response Helper** - Utilidades para crear respuestas estandarizadas

## 📋 Características Implementadas

### ✅ Manejo de Errores Automático

- **Captura global** de todas las excepciones
- **Logging automático** con correlation IDs
- **Sanitización** de datos sensibles
- **Categorización** por tipo y severidad
- **Auditoría de seguridad** para errores críticos

### ✅ Respuestas Estandarizadas

- **Formato consistente** para todos los endpoints
- **Metadatos automáticos** de paginación
- **Mensajes descriptivos** según la operación
- **Correlation IDs** para trazabilidad

### ✅ Errores Personalizados

- **BusinessLogicError** - Errores de lógica de negocio
- **ResourceNotFoundError** - Recursos no encontrados
- **DuplicateResourceError** - Recursos duplicados
- **ValidationError** - Errores de validación
- **AuthenticationError** - Errores de autenticación
- **AuthorizationError** - Errores de autorización

## 🚀 Uso del Sistema

### 1. Errores Automáticos

El sistema captura automáticamente cualquier excepción:

```typescript
@Get(':id')
async findUser(@Param('id') id: number) {
  // Si el usuario no existe, Sequelize lanzará un error
  // El GlobalExceptionFilter lo capturará automáticamente
  const user = await this.userService.findByPk(id, { rejectOnEmpty: true });
  return user;
}
```

### 2. Errores Personalizados con ErrorHelper

```typescript
import { ErrorHelper } from '../logging/custom-errors';

@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  // Verificar duplicado
  const existingUser = await this.userService.findByEmail(createUserDto.email);
  if (existingUser) {
    ErrorHelper.throwDuplicate('User', 'email', createUserDto.email);
  }

  // Validación de negocio
  if (createUserDto.age < 18) {
    ErrorHelper.throwBusinessError('User must be at least 18 years old', {
      minAge: 18,
      providedAge: createUserDto.age
    });
  }

  return this.userService.create(createUserDto);
}

@Get(':id')
async findUser(@Param('id') id: number) {
  const user = await this.userService.findById(id);
  if (!user) {
    ErrorHelper.throwNotFound('User', id);
  }
  return user;
}
```

### 3. Respuestas Estandarizadas Manuales

```typescript
import { ResponseHelper } from '../logging/response-transform.interceptor';

@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  const user = await this.userService.create(createUserDto);

  // Respuesta manual estandarizada
  return ResponseHelper.created(user, 'User created successfully');
}

@Get()
async findUsers(@Query() query: any) {
  const { users, total } = await this.userService.findPaginated(query);

  // Respuesta paginada
  return ResponseHelper.paginated(
    users,
    total,
    query.page || 1,
    query.limit || 10,
    'Users retrieved successfully'
  );
}
```

## 📊 Formato de Respuestas

### Respuestas Exitosas

```json
{
  "success": true,
  "statusCode": 200,
  "timestamp": "2025-10-05T12:34:56.789Z",
  "path": "/users",
  "method": "GET",
  "data": [...],
  "message": "Users retrieved successfully",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Respuestas de Error

```json
{
  "statusCode": 404,
  "timestamp": "2025-10-05T12:34:56.789Z",
  "path": "/users/999",
  "method": "GET",
  "message": "User with ID \"999\" not found",
  "error": "ResourceNotFoundError",
  "correlationId": "err_1759667890123_abc123def"
}
```

### Errores de Validación

```json
{
  "statusCode": 400,
  "timestamp": "2025-10-05T12:34:56.789Z",
  "path": "/users",
  "method": "POST",
  "message": "Validation failed",
  "error": "ValidationError",
  "correlationId": "err_1759667890124_def456ghi",
  "details": [
    {
      "property": "email",
      "value": "invalid-email",
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ]
}
```

## 🔧 Configuración Avanzada

### Personalizar Mensajes de Error

```typescript
// En el controlador
@Post()
async complexOperation(@Body() data: any) {
  try {
    return await this.service.complexOperation(data);
  } catch (error) {
    // El GlobalExceptionFilter manejará automáticamente
    // cualquier error lanzado aquí
    throw error;
  }
}
```

### Logging Detallado de Errores

El sistema automáticamente:

- ✅ Registra todos los errores con correlation IDs
- ✅ Categoriza errores por severidad y tipo
- ✅ Genera logs de seguridad para errores críticos
- ✅ Sanitiza información sensible
- ✅ Proporciona trazabilidad completa

## 🛡️ Beneficios de Seguridad

### Sanitización Automática

- ✅ Passwords y tokens nunca aparecen en logs
- ✅ Stack traces solo en desarrollo
- ✅ Información sensible censurada automáticamente

### Auditoría de Seguridad

- ✅ Errores 401/403 se registran como eventos de seguridad
- ✅ Intentos de acceso no autorizado se trackean
- ✅ Rate limiting y ataques se detectan automáticamente

## 📈 Beneficios del Sistema

### Para Desarrolladores:

- ✅ **Menos código** - No más try/catch dispersos
- ✅ **Consistencia** - Todas las respuestas siguen el mismo formato
- ✅ **Debugging fácil** - Correlation IDs y logging automático
- ✅ **Tipos seguros** - ErrorHelper con TypeScript

### Para Usuarios:

- ✅ **Mensajes claros** - Errores descriptivos y útiles
- ✅ **Experiencia consistente** - Formato uniforme en toda la app
- ✅ **Información útil** - Contexto suficiente para entender errores

### Para Operaciones:

- ✅ **Monitoreo completo** - Todos los errores se registran automáticamente
- ✅ **Trazabilidad** - Correlation IDs para seguir requests
- ✅ **Seguridad** - Auditoría automática de eventos críticos
- ✅ **Métricas** - Estadísticas automáticas de errores

## 🎉 Resultado Final

Con este sistema implementado:

1. **100% de errores capturados** automáticamente
2. **0 try/catch** necesarios en la mayoría de casos
3. **Respuestas consistentes** en toda la aplicación
4. **Logging y auditoría** automáticos
5. **Experiencia de desarrollo** significativamente mejorada

El sistema está completamente integrado y funciona de manera transparente con el resto de la aplicación.
