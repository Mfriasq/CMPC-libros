import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsEnum,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsSafeText } from "./security-validators";

// Enum para ordenamiento
export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

// DTO base para paginación
export class PaginationDto {
  @ApiPropertyOptional({
    description: "Número de página (empezando desde 1)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "La página debe ser un número entero" })
  @Min(1, { message: "La página debe ser mayor a 0" })
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de elementos por página",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "El límite debe ser un número entero" })
  @Min(1, { message: "El límite debe ser mayor a 0" })
  @Max(100, { message: "El límite no puede ser mayor a 100" })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Campo por el cual ordenar",
    example: "createdAt",
  })
  @IsOptional()
  @IsString({ message: "El campo de ordenamiento debe ser una cadena" })
  @Transform(({ value }) => value?.trim())
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Dirección del ordenamiento",
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: "El orden debe ser ASC o DESC" })
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: SortOrder = SortOrder.DESC;
}

// DTO para búsqueda de libros
export class LibroSearchDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Término de búsqueda en título, autor o editorial",
    example: "García Márquez",
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "La búsqueda debe ser una cadena" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "La búsqueda contiene caracteres no permitidos" })
  search?: string;

  @ApiPropertyOptional({
    description: "Filtrar por género específico",
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "El ID del género debe ser un número entero" })
  @Min(1, { message: "El ID del género debe ser positivo" })
  generoId?: number;

  @ApiPropertyOptional({
    description: "Precio mínimo",
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Type(() => Number)
  @Min(0, { message: "El precio mínimo debe ser mayor o igual a 0" })
  precioMin?: number;

  @ApiPropertyOptional({
    description: "Precio máximo",
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Type(() => Number)
  @Min(0, { message: "El precio máximo debe ser mayor o igual a 0" })
  precioMax?: number;

  @ApiPropertyOptional({
    description: "Año de publicación mínimo",
    example: 2000,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "El año debe ser un número entero" })
  @Min(1450, { message: "El año debe ser posterior a 1450" })
  @Max(2030, { message: "El año no puede ser muy futuro" })
  yearMin?: number;

  @ApiPropertyOptional({
    description: "Año de publicación máximo",
    example: 2025,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "El año debe ser un número entero" })
  @Min(1450, { message: "El año debe ser posterior a 1450" })
  @Max(2030, { message: "El año no puede ser muy futuro" })
  yearMax?: number;

  @ApiPropertyOptional({
    description: "Solo libros disponibles (con stock > 0)",
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  disponiblesOnly?: boolean = false;

  @ApiPropertyOptional({
    description: "Incluir libros eliminados (solo para administradores)",
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  includeDeleted?: boolean = false;

  // Validación condicional: precioMax debe ser mayor que precioMin
  @ValidateIf((o) => o.precioMin !== undefined && o.precioMax !== undefined)
  @Transform(({ value, obj }) => {
    if (obj.precioMin !== undefined && value <= obj.precioMin) {
      throw new Error("El precio máximo debe ser mayor al precio mínimo");
    }
    return value;
  })
  _validatePriceRange?: boolean;

  // Validación condicional: yearMax debe ser mayor que yearMin
  @ValidateIf((o) => o.yearMin !== undefined && o.yearMax !== undefined)
  @Transform(({ value, obj }) => {
    if (obj.yearMin !== undefined && value <= obj.yearMin) {
      throw new Error("El año máximo debe ser mayor al año mínimo");
    }
    return value;
  })
  _validateYearRange?: boolean;
}

// DTO para búsqueda de usuarios
export class UserSearchDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Término de búsqueda en nombre o email",
    example: "admin",
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "La búsqueda debe ser una cadena" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "La búsqueda contiene caracteres no permitidos" })
  search?: string;

  @ApiPropertyOptional({
    description: "Filtrar por rol específico",
    example: "admin",
  })
  @IsOptional()
  @IsString({ message: "El rol debe ser una cadena" })
  @IsIn(["user", "admin", "librarian"], {
    message: "El rol debe ser user, admin o librarian",
  })
  role?: string;

  @ApiPropertyOptional({
    description: "Solo usuarios activos (no eliminados)",
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  activeOnly?: boolean = true;
}

// DTO para reportes de auditoría
export class AuditSearchDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Categoría de auditoría",
    example: "BOOK_MANAGEMENT",
  })
  @IsOptional()
  @IsString({ message: "La categoría debe ser una cadena" })
  @IsIn(
    [
      "AUTH",
      "USER_MANAGEMENT",
      "BOOK_MANAGEMENT",
      "GENRE_MANAGEMENT",
      "SECURITY",
      "SYSTEM",
    ],
    {
      message: "Categoría de auditoría inválida",
    }
  )
  category?: string;

  @ApiPropertyOptional({
    description: "Acción específica de auditoría",
    example: "CREATE_BOOK",
  })
  @IsOptional()
  @IsString({ message: "La acción debe ser una cadena" })
  @Transform(({ value }) => value?.trim().toUpperCase())
  action?: string;

  @ApiPropertyOptional({
    description: "ID del usuario que realizó la acción",
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsInt({ message: "El ID del usuario debe ser un número entero" })
  @Min(1, { message: "El ID del usuario debe ser positivo" })
  userId?: number;

  @ApiPropertyOptional({
    description: "Solo eventos exitosos",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  successOnly?: boolean;

  @ApiPropertyOptional({
    description: "Fecha de inicio (ISO 8601)",
    example: "2024-01-01T00:00:00Z",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Formato de fecha inválido");
      }
      return date;
    }
    return value;
  })
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: "Fecha de fin (ISO 8601)",
    example: "2024-12-31T23:59:59Z",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Formato de fecha inválido");
      }
      return date;
    }
    return value;
  })
  dateTo?: Date;
}
