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
  @AuditBookManagement("CREATE_BOOK")
  async create(
    @Body() createLibroDto: CreateLibroDto,
    @Request() req: any
  ): Promise<Libro> {
    try {
      const libro = await this.librosService.create(createLibroDto);

      // Log de auditoría para creación exitosa
      this.loggingService.auditBookManagement(
        "CREATE_BOOK_SUCCESS",
        req.user.id,
        req.user.email,
        req.user.role,
        libro.id,
        true,
        {
          bookTitle: libro.titulo,
          bookAuthor: libro.autor,
          bookGenre: libro.generoId,
        },
        req
      );

      return libro;
    } catch (error) {
      // Log de auditoría para error en creación
      this.loggingService.auditBookManagement(
        "CREATE_BOOK_FAILURE",
        req.user.id,
        req.user.email,
        req.user.role,
        undefined,
        false,
        {
          bookData: createLibroDto,
          error: error.message,
        },
        req
      );

      throw error;
    }
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
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<{
    data: Libro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.librosService.findAll(+page, +limit);
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
    return this.librosService.search(
      {
        titulo,
        autor,
        editorial,
        generoId,
        estado,
      },
      +page,
      +limit
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
    try {
      // Obtener datos anteriores para auditoría
      const oldBook = await this.librosService.findOne(id);

      const updatedBook = await this.librosService.update(id, updateLibroDto);

      // Log de cambios para auditoría
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

      // Log de auditoría para actualización exitosa
      this.loggingService.auditBookManagement(
        "UPDATE_BOOK_SUCCESS",
        req.user.id,
        req.user.email,
        req.user.role,
        id,
        true,
        {
          bookTitle: updatedBook.titulo,
          changes: updateLibroDto,
        },
        req
      );

      return updatedBook;
    } catch (error) {
      // Log de auditoría para error en actualización
      this.loggingService.auditBookManagement(
        "UPDATE_BOOK_FAILURE",
        req.user.id,
        req.user.email,
        req.user.role,
        id,
        false,
        {
          updateData: updateLibroDto,
          error: error.message,
        },
        req
      );

      throw error;
    }
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
    try {
      // Obtener datos del libro antes de eliminarlo para auditoría
      const bookToDelete = await this.librosService.findOne(id);

      await this.librosService.eliminar(id);

      // Log de auditoría para eliminación exitosa
      this.loggingService.auditBookManagement(
        "DELETE_BOOK_SUCCESS",
        req.user.id,
        req.user.email,
        req.user.role,
        id,
        true,
        {
          bookTitle: bookToDelete.titulo,
          bookAuthor: bookToDelete.autor,
          deletionType: "soft_delete",
        },
        req
      );
    } catch (error) {
      // Log de auditoría para error en eliminación
      this.loggingService.auditBookManagement(
        "DELETE_BOOK_FAILURE",
        req.user.id,
        req.user.email,
        req.user.role,
        id,
        false,
        {
          error: error.message,
        },
        req
      );

      throw error;
    }
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
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
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

    const csvContent = await this.librosService.exportToCsv(filters);
    res.send(csvContent);
  }
}
