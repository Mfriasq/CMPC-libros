import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.model";
import { LibrosService } from "./libros.service";
import {
  CreateLibroDto,
  UpdateLibroDto,
  LibroResponseDto,
} from "./dto/libro.dto";
import { Libro } from "./libro.model";

@ApiTags("Libros")
@Controller("libros")
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo libro" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({ type: CreateLibroDto })
  @ApiResponse({
    status: 201,
    description: "El libro ha sido creado exitosamente.",
    type: LibroResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "El libro ya existe.",
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async create(@Body() createLibroDto: CreateLibroDto): Promise<Libro> {
    return this.librosService.create(createLibroDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Requiere estar autenticado
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener todos los libros." })
  @ApiResponse({
    status: 200,
    description: "Lista de libros.",
    type: [LibroResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async findAll(): Promise<Libro[]> {
    return this.librosService.findAll();
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Buscar libros por múltiples criterios" })
  @ApiQuery({
    name: "titulo",
    required: false,
    description: "Buscar por título (búsqueda parcial)",
    example: "Cien años",
  })
  @ApiQuery({
    name: "autor",
    required: false,
    description: "Buscar por autor (búsqueda parcial)",
    example: "García",
  })
  @ApiQuery({
    name: "editorial",
    required: false,
    description: "Buscar por editorial (búsqueda parcial)",
    example: "Sudamericana",
  })
  @ApiQuery({
    name: "genero",
    required: false,
    description: "Buscar por género (búsqueda exacta)",
    example: "Ficción",
  })
  @ApiResponse({
    status: 200,
    description: "Libros encontrados según los criterios de búsqueda.",
    type: [LibroResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async search(
    @Query("titulo") titulo?: string,
    @Query("autor") autor?: string,
    @Query("editorial") editorial?: string,
    @Query("genero") genero?: string
  ): Promise<Libro[]> {
    return this.librosService.search({
      titulo,
      autor,
      editorial,
      genero,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener un libro por ID" })
  @ApiParam({
    name: "id",
    description: "ID único del libro",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Libro encontrado.",
    type: LibroResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Libro no encontrado.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Libro> {
    return this.librosService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Actualizar un libro" })
  @ApiParam({
    name: "id",
    description: "ID único del libro",
    example: 1,
  })
  @ApiBody({ type: UpdateLibroDto })
  @ApiResponse({
    status: 200,
    description: "El libro ha sido actualizado exitosamente.",
    type: LibroResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Libro no encontrado.",
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLibroDto: UpdateLibroDto
  ): Promise<Libro> {
    return this.librosService.update(id, updateLibroDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un libro (soft delete)" })
  @ApiParam({
    name: "id",
    description: "ID único del libro",
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: "El libro ha sido eliminado exitosamente (soft delete).",
  })
  @ApiResponse({
    status: 404,
    description: "Libro no encontrado.",
  })
  @ApiResponse({
    status: 409,
    description: "El libro ya está eliminado.",
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.librosService.eliminar(id);
  }

  @Patch("restore/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Restaurar un libro eliminado" })
  @ApiParam({
    name: "id",
    description: "ID único del libro a restaurar",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "El libro ha sido restaurado exitosamente.",
    type: LibroResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Libro no encontrado.",
  })
  @ApiResponse({
    status: 409,
    description: "El libro no está eliminado.",
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async restore(@Param("id", ParseIntPipe) id: number): Promise<Libro> {
    return this.librosService.restaurar(id);
  }
}
