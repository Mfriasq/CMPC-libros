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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
import { User, UserRole } from "./user.model";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Gestión de Usuarios")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Crear un nuevo usuario (Solo administradores)" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "Usuario creado exitosamente",
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: "El email ya está registrado",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado - Se requieren permisos de administrador",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido",
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
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios",
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
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
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
}
