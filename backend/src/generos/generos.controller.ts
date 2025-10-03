import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GenerosService } from "./generos.service";
import { CreateGeneroDto, UpdateGeneroDto } from "./dto/genero.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.model";

@ApiTags("Géneros")
@Controller("generos")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: "Crear un nuevo género" })
  @ApiResponse({
    status: 201,
    description: "El género ha sido creado exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
  })
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generosService.create(createGeneroDto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los géneros activos" })
  @ApiResponse({
    status: 200,
    description: "Lista de géneros obtenida exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  findAll() {
    return this.generosService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un género por ID" })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Género encontrado exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: "Actualizar un género" })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido actualizado exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateGeneroDto: UpdateGeneroDto
  ) {
    return this.generosService.update(id, updateGeneroDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: "Eliminar un género (soft delete)" })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido eliminado exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.remove(id);
  }

  @Patch(":id/restore")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Restaurar un género eliminado" })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido restaurado exitosamente.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Solo administradores.",
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
  })
  restore(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.restore(id);
  }
}
