import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsIn,
  IsNotEmpty,
  IsPositive,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsValidPrice,
  IsSafeName,
  IsValidImageUrl,
} from "../../validators/custom-validators";
import { IsSafeText } from "../../validators/security-validators";

export class CreateLibroDto {
  @ApiProperty({
    description: "Título del libro",
    example: "Cien años de soledad",
    minLength: 1,
    maxLength: 200,
  })
  @IsNotEmpty({ message: "El título es requerido" })
  @IsString({ message: "El título debe ser una cadena de texto" })
  @MinLength(1, { message: "El título no puede estar vacío" })
  @MaxLength(200, { message: "El título no puede exceder 200 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "El título contiene caracteres no permitidos" })
  titulo: string;

  @ApiProperty({
    description: "Autor del libro",
    example: "Gabriel García Márquez",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "El autor es requerido" })
  @IsString({ message: "El autor debe ser una cadena de texto" })
  @MinLength(2, {
    message: "El nombre del autor debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre del autor no puede exceder 100 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre del autor contiene caracteres no válidos" })
  autor: string;

  @ApiProperty({
    description: "Editorial del libro",
    example: "Sudamericana",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "La editorial es requerida" })
  @IsString({ message: "La editorial debe ser una cadena de texto" })
  @MinLength(2, {
    message: "El nombre de la editorial debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre de la editorial no puede exceder 100 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({
    message: "El nombre de la editorial contiene caracteres no válidos",
  })
  editorial: string;

  @ApiProperty({
    description: "Precio del libro en CLP",
    example: 15990,
    minimum: 100,
    maximum: 1000000,
  })
  @IsNotEmpty({ message: "El precio es requerido" })
  @Type(() => Number)
  @IsPositive({ message: "El precio debe ser un número positivo" })
  @Min(100, { message: "El precio mínimo es $100" })
  @Max(1000000, { message: "El precio máximo es $1,000,000" })
  @IsValidPrice({ message: "El precio debe tener máximo 2 decimales" })
  precio: number;

  @ApiProperty({
    description: "Cantidad de ejemplares disponibles",
    example: 5,
    minimum: 0,
    maximum: 10000,
  })
  @IsNotEmpty({ message: "La disponibilidad es requerida" })
  @Type(() => Number)
  @IsInt({ message: "La disponibilidad debe ser un número entero" })
  @Min(0, { message: "La disponibilidad no puede ser negativa" })
  @Max(10000, { message: "La disponibilidad máxima es 10,000 ejemplares" })
  disponibilidad: number;

  @ApiProperty({
    description: "ID del género del libro",
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty({ message: "El género es requerido" })
  @Type(() => Number)
  @IsInt({ message: "El ID del género debe ser un número entero" })
  @Min(1, { message: "El ID del género debe ser válido" })
  generoId: number;

  @ApiProperty({
    description: "URL de la imagen del libro",
    example: "/uploads/libros/libro-123.jpg",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "La URL de imagen debe ser una cadena de texto" })
  @MaxLength(500, {
    message: "La URL de imagen no puede exceder 500 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsValidImageUrl({
    message: "La URL de imagen debe ser válida y tener una extensión permitida",
  })
  imagenUrl?: string;
}

export class UpdateLibroDto {
  @ApiProperty({
    description: "Título del libro",
    example: "Cien años de soledad",
    minLength: 1,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: "El título debe ser una cadena de texto" })
  @MinLength(1, { message: "El título no puede estar vacío" })
  @MaxLength(200, { message: "El título no puede exceder 200 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "El título contiene caracteres no permitidos" })
  titulo?: string;

  @ApiProperty({
    description: "Autor del libro",
    example: "Gabriel García Márquez",
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: "El autor debe ser una cadena de texto" })
  @MinLength(2, {
    message: "El nombre del autor debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre del autor no puede exceder 100 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre del autor contiene caracteres no válidos" })
  autor?: string;

  @ApiProperty({
    description: "Editorial del libro",
    example: "Sudamericana",
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: "La editorial debe ser una cadena de texto" })
  @MinLength(2, {
    message: "El nombre de la editorial debe tener al menos 2 caracteres",
  })
  @MaxLength(100, {
    message: "El nombre de la editorial no puede exceder 100 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({
    message: "El nombre de la editorial contiene caracteres no válidos",
  })
  editorial?: string;

  @ApiProperty({
    description: "Precio del libro en CLP",
    example: 15990,
    minimum: 100,
    maximum: 1000000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "El precio debe ser un número positivo" })
  @Min(100, { message: "El precio mínimo es $100" })
  @Max(1000000, { message: "El precio máximo es $1,000,000" })
  @IsValidPrice({ message: "El precio debe tener máximo 2 decimales" })
  precio?: number;

  @ApiProperty({
    description: "Cantidad de ejemplares disponibles",
    example: 3,
    minimum: 0,
    maximum: 10000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "La disponibilidad debe ser un número entero" })
  @Min(0, { message: "La disponibilidad no puede ser negativa" })
  @Max(10000, { message: "La disponibilidad máxima es 10,000 ejemplares" })
  disponibilidad?: number;

  @ApiProperty({
    description: "ID del género del libro",
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "El ID del género debe ser un número entero" })
  @Min(1, { message: "El ID del género debe ser válido" })
  generoId?: number;

  @ApiProperty({
    description: "URL de la imagen del libro",
    example: "/uploads/libros/libro-123.jpg",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "La URL de imagen debe ser una cadena de texto" })
  @MaxLength(500, {
    message: "La URL de imagen no puede exceder 500 caracteres",
  })
  @Transform(({ value }) => value?.trim())
  @IsValidImageUrl({
    message: "La URL de imagen debe ser válida y tener una extensión permitida",
  })
  imagenUrl?: string;
}

export class LibroResponseDto {
  @ApiProperty({
    description: "ID único del libro",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Título del libro",
    example: "Cien años de soledad",
  })
  titulo: string;

  @ApiProperty({
    description: "Autor del libro",
    example: "Gabriel García Márquez",
  })
  autor: string;

  @ApiProperty({
    description: "Editorial del libro",
    example: "Editorial Sudamericana",
  })
  editorial: string;

  @ApiProperty({
    description: "Precio del libro en CLP",
    example: 15990,
  })
  precio: number;

  @ApiProperty({
    description: "Cantidad de ejemplares disponibles",
    example: 5,
  })
  disponibilidad: number;

  @ApiProperty({
    description: "ID del género",
    example: 1,
  })
  generoId: number;

  @ApiProperty({
    description: "Información del género",
    example: {
      id: 1,
      nombre: "Ficción",
      descripcion: "Literatura narrativa de carácter imaginativo",
    },
  })
  genero: {
    id: number;
    nombre: string;
    descripcion?: string;
  };

  @ApiProperty({
    description: "Estado del libro",
    example: "activo",
  })
  estado: string;

  @ApiProperty({
    description: "Fecha de restauración",
    example: "2023-12-01T10:30:00Z",
    required: false,
  })
  restoredAt?: Date;

  @ApiProperty({
    description: "Fecha de eliminación lógica",
    example: null,
    required: false,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: "Fecha de creación",
    example: "2023-11-15T09:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Fecha de última actualización",
    example: "2023-11-20T14:30:00Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "URL de la imagen del libro",
    example: "/uploads/libros/cien-anos-soledad.jpg",
    required: false,
  })
  imagenUrl?: string;
}

export class PaginatedLibroResponseDto {
  @ApiProperty({
    description: "Estado de éxito de la operación",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Código de estado HTTP",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Timestamp de la respuesta",
    example: "2023-12-01T10:30:00Z",
  })
  timestamp: string;

  @ApiProperty({
    description: "Ruta del endpoint",
    example: "/libros",
  })
  path: string;

  @ApiProperty({
    description: "Método HTTP utilizado",
    example: "GET",
  })
  method: string;

  @ApiProperty({
    description: "Array de libros",
    type: [LibroResponseDto],
  })
  data: LibroResponseDto[];

  @ApiProperty({
    description: "Mensaje descriptivo de la operación",
    example: "Libros retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Información de paginación",
    example: {
      total: 25,
      page: 1,
      limit: 10,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class LibroCreatedResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación",
    example: "Libro creado exitosamente",
  })
  message: string;

  @ApiProperty({
    description: "Datos del libro creado",
    type: LibroResponseDto,
  })
  libro: LibroResponseDto;
}

export class LibroOperationResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación de la operación",
    example: "Libro actualizado exitosamente",
  })
  message: string;

  @ApiProperty({
    description: "Datos del libro después de la operación",
    type: LibroResponseDto,
  })
  libro: LibroResponseDto;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: "Mensaje del error",
    example: "Libro con ID 999 no encontrado",
  })
  message: string;

  @ApiProperty({
    description: "Código de estado HTTP",
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: "Tipo de error",
    example: "Not Found",
  })
  error: string;
}
