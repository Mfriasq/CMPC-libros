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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  Header,
  Request,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.model";
import { LibrosService } from "./libros.service";
import { LoggingService } from "../logging/logging.service";
import { AuditBookManagement } from "../logging/audit.decorator";
import {
  CreateLibroDto,
  UpdateLibroDto,
  LibroResponseDto,
  PaginatedLibroResponseDto,
  LibroCreatedResponseDto,
  LibroOperationResponseDto,
  ErrorResponseDto,
} from "./dto/libro.dto";
import { Libro } from "./libro.model";

@ApiTags("Libros")
@Controller("libros")
export class LibrosController {
  constructor(
    private readonly librosService: LibrosService,
    private readonly loggingService: LoggingService
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo libro" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({ type: CreateLibroDto })
  @ApiResponse({
    status: 201,
    description: "El libro ha sido creado exitosamente.",
    type: LibroCreatedResponseDto,
    schema: {
      example: {
        message: "Libro creado exitosamente",
        libro: {
          id: 1,
          titulo: "Cien años de soledad",
          autor: "Gabriel García Márquez",
          editorial: "Editorial Sudamericana",
          precio: 15990,
          disponibilidad: 5,
          generoId: 1,
          genero: {
            id: 1,
            nombre: "Ficción",
            descripcion: "Literatura narrativa de carácter imaginativo",
          },
          estado: "activo",
          restoredAt: null,
          deletedAt: null,
          createdAt: "2023-12-01T10:30:00Z",
          updatedAt: "2023-12-01T10:30:00Z",
          imagenUrl: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "El libro ya existe.",
    type: ErrorResponseDto,
    schema: {
      example: {
        message: "Ya existe un libro con ese título y editorial",
        statusCode: 409,
        error: "Conflict",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
    type: ErrorResponseDto,
    schema: {
      example: {
        message: [
          "El título es requerido",
          "El precio debe ser un número positivo",
        ],
        statusCode: 400,
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador.",
    type: ErrorResponseDto,
    schema: {
      example: {
        message: "Forbidden resource",
        statusCode: 403,
        error: "Forbidden",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    type: ErrorResponseDto,
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
        error: "Unauthorized",
      },
    },
  })
  @AuditBookManagement("CREATE_BOOK")
  async create(
    @Body() createLibroDto: CreateLibroDto,
    @Request() req: any
  ): Promise<Libro> {
    // El AuditInterceptor se encarga automáticamente del logging de auditoría
    return await this.librosService.create(createLibroDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Requiere estar autenticado
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener todos los libros con paginación." })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número de página (empezando desde 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Cantidad de elementos por página",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de libros.",
    type: PaginatedLibroResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 1,
            titulo: "Cien años de soledad",
            autor: "Gabriel García Márquez",
            editorial: "Editorial Sudamericana",
            precio: 15990,
            disponibilidad: 5,
            generoId: 1,
            genero: {
              id: 1,
              nombre: "Ficción",
              descripcion: "Literatura narrativa de carácter imaginativo",
            },
            estado: "activo",
            restoredAt: null,
            deletedAt: null,
            createdAt: "2025-10-01T10:30:00Z",
            updatedAt: "2025-10-01T10:30:00Z",
            imagenUrl: "/uploads/libros/cien-anos-soledad.jpg",
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
    type: ErrorResponseDto,
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401,
        error: "Unauthorized",
      },
    },
  })
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Request() req: any
  ): Promise<{
    data: Libro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const userRole = req.user?.role || "user";
    // Asegurarse de que page y limit sean números válidos
    const safePage = isNaN(+page) ? 1 : +page;
    const safeLimit = isNaN(+limit) ? 10 : +limit;
    return this.librosService.findAll(safePage, safeLimit, userRole);
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Buscar libros por múltiples criterios con paginación",
  })
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
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número de página (empezando desde 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Cantidad de elementos por página",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description:
      "Libros encontrados según los criterios de búsqueda con paginación.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async search(
    @Request() req: any,
    @Query("titulo") titulo?: string,
    @Query("autor") autor?: string,
    @Query("editorial") editorial?: string,
    @Query("generoId") generoId?: number,
    @Query("estado") estado?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<{
    data: Libro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const userRole = req.user?.role || "user";
    // Asegurarse de que page y limit sean números válidos
    const safePage = isNaN(+page) ? 1 : +page;
    const safeLimit = isNaN(+limit) ? 10 : +limit;
    return this.librosService.search(
      {
        titulo,
        autor,
        editorial,
        generoId,
        estado,
      },
      safePage,
      safeLimit,
      userRole
    );
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
  @AuditBookManagement("UPDATE_BOOK")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLibroDto: UpdateLibroDto,
    @Request() req: any
  ): Promise<Libro> {
    // Obtener datos anteriores para log de cambios
    const oldBook = await this.librosService.findOne(id);
    const updatedBook = await this.librosService.update(id, updateLibroDto);

    // Log de cambios para auditoría (mantenemos este específico)
    this.loggingService.logDataChange(
      "UPDATE",
      "Book",
      id,
      oldBook,
      updatedBook,
      req.user.id,
      req.user.email,
      req
    );

    return updatedBook;
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
  @AuditBookManagement("DELETE_BOOK")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    // El AuditInterceptor se encarga automáticamente del logging de auditoría
    await this.librosService.eliminar(id);
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

  @Post(":id/imagen")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @UseInterceptors(FileInterceptor("imagen"))
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary:
      "Subir imagen para un libro (Solo bibliotecarios y administradores)",
  })
  @ApiParam({ name: "id", description: "ID del libro" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        imagen: {
          type: "string",
          format: "binary",
          description:
            "Archivo de imagen (jpg, jpeg, png, gif, webp) - máximo 5MB",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Imagen subida exitosamente",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        imagenUrl: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Archivo inválido o no proporcionado",
  })
  @ApiResponse({
    status: 404,
    description: "Libro no encontrado",
  })
  @ApiResponse({
    status: 403,
    description:
      "Acceso denegado - Se requieren permisos de bibliotecario o administrador",
  })
  async uploadImagen(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: any
  ): Promise<{ message: string; imagenUrl: string }> {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo");
    }

    const imagenUrl = `/uploads/libros/${file.filename}`;
    await this.librosService.updateImagenUrl(id, imagenUrl);

    return {
      message: "Imagen subida exitosamente",
      imagenUrl,
    };
  }

  @Get("export/csv")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Exportar libros a CSV",
    description: "Genera y descarga un archivo CSV con todos los libros",
  })
  @ApiQuery({
    name: "titulo",
    required: false,
    description: "Filtrar por título (búsqueda parcial)",
  })
  @ApiQuery({
    name: "autor",
    required: false,
    description: "Filtrar por autor (búsqueda parcial)",
  })
  @ApiQuery({
    name: "editorial",
    required: false,
    description: "Filtrar por editorial (búsqueda parcial)",
  })
  @ApiQuery({
    name: "generoId",
    required: false,
    type: Number,
    description: "Filtrar por ID de género",
  })
  @ApiQuery({
    name: "estado",
    required: false,
    description: "Filtrar por estado (activo, eliminado)",
  })
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="libros.csv"')
  async exportToCsv(
    @Request() req: any,
    @Res() res: Response,
    @Query("titulo") titulo?: string,
    @Query("autor") autor?: string,
    @Query("editorial") editorial?: string,
    @Query("generoId") generoId?: number,
    @Query("estado") estado?: string
  ): Promise<void> {
    const filters = {
      titulo,
      autor,
      editorial,
      generoId,
      estado,
    };

    const userRole = req.user?.role || "user";
    const csvContent = await this.librosService.exportToCsv(filters, userRole);
    res.send(csvContent);
  }
}
