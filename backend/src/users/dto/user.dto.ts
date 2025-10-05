import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsEnum,
  IsNotEmpty,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../user.model";
import {
  IsStrongPassword,
  IsCorporateEmail,
  IsPasswordMatch,
  IsSafeText,
} from "../../validators/security-validators";
import { IsSafeName } from "../../validators/custom-validators";

export class CreateUserDto {
  @ApiProperty({
    description: "Email del usuario (debe ser de dominio autorizado)",
    example: "usuario@biblioteca.com",
    format: "email",
  })
  @IsNotEmpty({ message: "El email es requerido" })
  @IsEmail({}, { message: "El email debe tener un formato válido" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: "El email no puede exceder 100 caracteres" })
  @IsCorporateEmail({
    message: "El email debe pertenecer a un dominio autorizado",
  })
  email: string;

  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Juan Pérez González",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre contiene caracteres no válidos" })
  name: string;

  @ApiProperty({
    description: "Contraseña segura del usuario",
    example: "MiContraseña123!",
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(128, { message: "La contraseña no puede exceder 128 caracteres" })
  @IsStrongPassword({
    message:
      "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos especiales",
  })
  password: string;

  @ApiProperty({
    description: "Confirmación de contraseña",
    example: "MiContraseña123!",
  })
  @IsNotEmpty({ message: "La confirmación de contraseña es requerida" })
  @IsString({ message: "La confirmación debe ser una cadena de texto" })
  @IsPasswordMatch("password", { message: "Las contraseñas no coinciden" })
  confirmPassword: string;

  @ApiPropertyOptional({
    description: "Rol del usuario en el sistema",
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "El rol debe ser user, admin o librarian" })
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({
    description: "Edad del usuario",
    example: 25,
    minimum: 13,
    maximum: 120,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "La edad debe ser un número entero" })
  @Min(13, { message: "La edad mínima es 13 años" })
  @Max(120, { message: "La edad máxima es 120 años" })
  age?: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "Nombre completo del usuario",
    example: "Juan Pérez González",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre contiene caracteres no válidos" })
  name?: string;

  @ApiPropertyOptional({
    description: "Email del usuario (debe ser de dominio autorizado)",
    example: "usuario@biblioteca.com",
    format: "email",
  })
  @IsOptional()
  @IsEmail({}, { message: "El email debe tener un formato válido" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: "El email no puede exceder 100 caracteres" })
  @IsCorporateEmail({
    message: "El email debe pertenecer a un dominio autorizado",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "Edad del usuario",
    example: 30,
    minimum: 13,
    maximum: 120,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "La edad debe ser un número entero" })
  @Min(13, { message: "La edad mínima es 13 años" })
  @Max(120, { message: "La edad máxima es 120 años" })
  age?: number;

  @ApiPropertyOptional({
    description: "Rol del usuario en el sistema (solo para administradores)",
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "El rol debe ser user, admin o librarian" })
  role?: UserRole;
}

// DTO específico para cambio de contraseña
export class ChangePasswordDto {
  @ApiProperty({
    description: "Contraseña actual",
    example: "MiContraseñaActual123!",
  })
  @IsNotEmpty({ message: "La contraseña actual es requerida" })
  @IsString({ message: "La contraseña actual debe ser una cadena de texto" })
  currentPassword: string;

  @ApiProperty({
    description: "Nueva contraseña segura",
    example: "MiNuevaContraseña456!",
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty({ message: "La nueva contraseña es requerida" })
  @IsString({ message: "La nueva contraseña debe ser una cadena de texto" })
  @MinLength(8, {
    message: "La nueva contraseña debe tener al menos 8 caracteres",
  })
  @MaxLength(128, {
    message: "La nueva contraseña no puede exceder 128 caracteres",
  })
  @IsStrongPassword({
    message:
      "La nueva contraseña debe incluir mayúsculas, minúsculas, números y símbolos especiales",
  })
  newPassword: string;

  @ApiProperty({
    description: "Confirmación de la nueva contraseña",
    example: "MiNuevaContraseña456!",
  })
  @IsNotEmpty({ message: "La confirmación de contraseña es requerida" })
  @IsString({ message: "La confirmación debe ser una cadena de texto" })
  @IsPasswordMatch("newPassword", { message: "Las contraseñas no coinciden" })
  confirmNewPassword: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: "ID único del usuario",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@biblioteca.com",
  })
  email: string;

  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Juan Pérez González",
  })
  name: string;

  @ApiProperty({
    description: "Edad del usuario",
    example: 28,
    required: false,
  })
  age?: number;

  @ApiProperty({
    description: "Rol del usuario",
    example: "user",
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    description: "ID del estado del usuario",
    example: 1,
  })
  estadoId: number;

  @ApiProperty({
    description: "Información del estado",
    example: {
      id: 1,
      nombre: "activo",
      descripcion: "Usuario activo en el sistema",
    },
  })
  estado: {
    id: number;
    nombre: string;
    descripcion?: string;
  };

  @ApiProperty({
    description: "Fecha de restauración",
    example: null,
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
}

export class PaginatedUserResponseDto {
  @ApiProperty({
    description: "Lista de usuarios",
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: "Número total de usuarios",
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: "Página actual",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Total de páginas",
    example: 2,
  })
  totalPages: number;
}

export class UserCreatedResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación",
    example: "Usuario creado exitosamente",
  })
  message: string;

  @ApiProperty({
    description: "Datos del usuario creado",
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
