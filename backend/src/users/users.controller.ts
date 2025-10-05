import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  PaginatedUserResponseDto,
  UserCreatedResponseDto,
} from "./dto/user.dto";
import { User, UserRole } from "./user.model";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ErrorHelper } from "../logging/custom-errors";
import { ResponseHelper } from "../logging/response-transform.interceptor";

@ApiTags("Gestión de Usuarios")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Crear un nuevo usuario (Solo administradores)",
    description:
      "Crea un nuevo usuario en el sistema. Solo los administradores pueden crear usuarios.",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "Usuario creado exitosamente",
    type: UserCreatedResponseDto,
    schema: {
      example: {
        message: "Usuario creado exitosamente",
        user: {
          id: 5,
          email: "nuevo@biblioteca.com",
          name: "Nuevo Usuario",
          age: 25,
          role: "user",
          estado: {
            id: 1,
            nombre: "activo",
          },
          createdAt: "2025-10-02T14:30:00.000Z",
          updatedAt: "2025-10-02T14:30:00.000Z",
          deletedAt: null,
          restoredAt: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos",
    schema: {
      example: {
        message: ["El email es requerido", "El formato del email no es válido"],
        error: "Bad Request",
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "El email ya está registrado",
    schema: {
      example: {
        message: "El email nuevo@biblioteca.com ya está registrado",
        error: "Conflict",
        statusCode: 409,
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener todos los usuarios (Solo administradores)",
    description:
      "Devuelve una lista paginada de todos los usuarios del sistema. Solo administradores pueden acceder a esta información.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios",
    type: PaginatedUserResponseDto,
    schema: {
      example: {
        users: [
          {
            id: 1,
            email: "admin@biblioteca.com",
            name: "Administrador",
            age: 30,
            role: "admin",
            estado: {
              id: 1,
              nombre: "activo",
            },
            createdAt: "2025-10-01T10:00:00.000Z",
            updatedAt: "2025-10-01T10:00:00.000Z",
            deletedAt: null,
            restoredAt: null,
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número de página (empezando desde 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Cantidad de usuarios por página",
    example: 10,
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Asegurarse de que page y limit sean números válidos
    const safePage = isNaN(+page) ? 1 : +page;
    const safeLimit = isNaN(+limit) ? 10 : +limit;
    return this.usersService.findAll(safePage, safeLimit);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener un usuario por ID (Solo administradores)" })
  @ApiParam({ name: "id", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario encontrado",
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Actualizar un usuario (Solo administradores)" })
  @ApiParam({ name: "id", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario actualizado",
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Eliminar un usuario (Solo administradores)" })
  @ApiParam({ name: "id", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario eliminado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(":id/restore")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Restaurar un usuario eliminado (Solo administradores)",
  })
  @ApiParam({ name: "id", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Usuario restaurado exitosamente",
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  restore(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.usersService.restore(id);
  }

  @Get("search/:query")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Buscar usuarios por nombre o email (Solo administradores)",
  })
  @ApiParam({ name: "query", description: "Término de búsqueda" })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios que coinciden con la búsqueda",
    type: [User],
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
  })
  search(@Param("query") query: string): Promise<User[]> {
    return this.usersService.search(query);
  }
}
