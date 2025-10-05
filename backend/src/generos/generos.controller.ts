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
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { GenerosService } from "./generos.service";
import {
  CreateGeneroDto,
  UpdateGeneroDto,
  GeneroResponseDto,
  GeneroCreatedResponseDto,
  GeneroOperationResponseDto,
} from "./dto/genero.dto";
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
  @ApiOperation({
    summary: "Crear un nuevo género",
    description:
      "Crea un nuevo género literario. Solo administradores y bibliotecarios pueden crear géneros.",
  })
  @ApiResponse({
    status: 201,
    description: "El género ha sido creado exitosamente.",
    type: GeneroCreatedResponseDto,
    schema: {
      example: {
        message: "Género creado exitosamente",
        genero: {
          id: 5,
          nombre: "Ficción Científica",
          descripcion:
            "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
          createdAt: "2025-10-02T14:30:00.000Z",
          updatedAt: "2025-10-02T14:30:00.000Z",
          deletedAt: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
    schema: {
      example: {
        message: [
          "El nombre del género es requerido",
          "El nombre debe tener al menos 2 caracteres",
        ],
        error: "Bad Request",
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403,
      },
    },
  })
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generosService.create(createGeneroDto);
  }

  @Get()
  @ApiOperation({
    summary: "Obtener todos los géneros activos",
    description:
      "Devuelve una lista de todos los géneros literarios disponibles (no eliminados)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de géneros obtenida exitosamente.",
    type: [GeneroResponseDto],
    schema: {
      example: [
        {
          id: 1,
          nombre: "Ficción Científica",
          descripcion:
            "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
          createdAt: "2025-10-01T10:00:00.000Z",
          updatedAt: "2025-10-01T10:00:00.000Z",
          deletedAt: null,
        },
        {
          id: 2,
          nombre: "Fantasía",
          descripcion: "Género narrativo basado en la fantasía",
          createdAt: "2025-10-01T10:00:00.000Z",
          updatedAt: "2025-10-01T10:00:00.000Z",
          deletedAt: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número de página para paginación (opcional)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Cantidad de géneros por página (opcional)",
    example: 10,
  })
  findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    // Validar parámetros si se proporcionan
    const safePage = page && !isNaN(+page) ? +page : undefined;
    const safeLimit = limit && !isNaN(+limit) ? +limit : undefined;
    return this.generosService.findAll(safePage, safeLimit);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener un género por ID",
    description: "Devuelve un género específico basado en su ID único",
  })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Género encontrado exitosamente.",
    type: GeneroResponseDto,
    schema: {
      example: {
        id: 1,
        nombre: "Ficción Científica",
        descripcion:
          "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
        createdAt: "2025-10-01T10:00:00.000Z",
        updatedAt: "2025-10-01T10:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
    schema: {
      example: {
        message: "Género con ID 999 no encontrado",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({
    summary: "Actualizar un género",
    description:
      "Actualiza la información de un género existente. Solo administradores y bibliotecarios pueden actualizar géneros.",
  })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido actualizado exitosamente.",
    type: GeneroOperationResponseDto,
    schema: {
      example: {
        message: "Género actualizado exitosamente",
        genero: {
          id: 1,
          nombre: "Ciencia Ficción",
          descripcion:
            "Narrativa que explora las posibilidades científicas y tecnológicas",
          createdAt: "2025-10-01T10:00:00.000Z",
          updatedAt: "2025-10-02T14:30:00.000Z",
          deletedAt: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
    schema: {
      example: {
        message: ["El nombre debe tener al menos 2 caracteres"],
        error: "Bad Request",
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
    schema: {
      example: {
        message: "Género con ID 999 no encontrado",
        error: "Not Found",
        statusCode: 404,
      },
    },
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
  @ApiOperation({
    summary: "Eliminar un género (soft delete)",
    description:
      "Elimina lógicamente un género marcándolo como eliminado. Solo administradores y bibliotecarios pueden eliminar géneros.",
  })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido eliminado exitosamente.",
    schema: {
      example: {
        message: "Género eliminado exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Rol insuficiente.",
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
    schema: {
      example: {
        message: "Género con ID 999 no encontrado",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.remove(id);
  }

  @Patch(":id/restore")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Restaurar un género eliminado",
    description:
      "Restaura un género previamente eliminado (soft delete). Solo administradores pueden restaurar géneros.",
  })
  @ApiParam({
    name: "id",
    description: "ID único del género",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "El género ha sido restaurado exitosamente.",
    type: GeneroOperationResponseDto,
    schema: {
      example: {
        message: "Género restaurado exitosamente",
        genero: {
          id: 1,
          nombre: "Ficción Científica",
          descripcion:
            "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
          createdAt: "2025-10-01T10:00:00.000Z",
          updatedAt: "2025-10-02T14:30:00.000Z",
          deletedAt: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Prohibido - Solo administradores.",
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Género no encontrado.",
    schema: {
      example: {
        message: "Género con ID 999 no encontrado o no está eliminado",
        error: "Not Found",
        statusCode: 404,
      },
    },
  })
  restore(@Param("id", ParseIntPipe) id: number) {
    return this.generosService.restore(id);
  }
}
