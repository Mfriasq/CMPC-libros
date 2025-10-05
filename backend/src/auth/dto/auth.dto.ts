import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from "class-validator";
import { Transform } from "class-transformer";
import { UserRole } from "../../users/user.model";
import { IsCorporateEmail } from "../../validators/security-validators";

export class LoginDto {
  @ApiProperty({
    description: "Email del usuario registrado en el sistema",
    example: "admin@biblioteca.com",
    format: "email",
  })
  @IsNotEmpty({ message: "El email es requerido para iniciar sesión" })
  @IsEmail({}, { message: "El formato del email no es válido" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: "El email no puede exceder 100 caracteres" })
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "MiContraseña123!",
    minLength: 6,
    maxLength: 128,
  })
  @IsNotEmpty({ message: "La contraseña es requerida para iniciar sesión" })
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @MaxLength(128, { message: "La contraseña no puede exceder 128 caracteres" })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "Token JWT de acceso",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AYmlibGlvdGVjYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTc0NTYyNzAsImV4cCI6MTY5NzQ1OTg3MH0.aBcDeFgHiJkLmNoPqRsTuVwXyZ",
    type: "string",
  })
  access_token: string;

  @ApiProperty({
    description: "Información del usuario autenticado",
    type: "object",
    example: {
      id: 1,
      email: "admin@biblioteca.com",
      name: "Administrador",
      age: 30,
      role: "admin",
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
    age?: number;
    role: UserRole;
  };
}

export class LoginErrorResponseDto {
  @ApiProperty({
    description: "Mensaje de error",
    example: "Credenciales inválidas",
    type: "string",
  })
  message: string;

  @ApiProperty({
    description: "Código de estado HTTP",
    example: 401,
    type: "number",
  })
  statusCode: number;

  @ApiProperty({
    description: "Error específico",
    example: "Unauthorized",
    type: "string",
  })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: "Mensajes de error de validación",
    example: [
      "El email es requerido para iniciar sesión",
      "El formato del email no es válido",
    ],
    type: "array",
    items: { type: "string" },
  })
  message: string[];

  @ApiProperty({
    description: "Código de estado HTTP",
    example: 400,
    type: "number",
  })
  statusCode: number;

  @ApiProperty({
    description: "Error específico",
    example: "Bad Request",
    type: "string",
  })
  error: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: "ID único del usuario",
    example: 1,
    type: "number",
  })
  id: number;

  @ApiProperty({
    description: "Correo electrónico del usuario",
    example: "admin@biblioteca.com",
    type: "string",
  })
  email: string;

  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Administrador",
    type: "string",
  })
  name: string;

  @ApiProperty({
    description: "Edad del usuario",
    example: 30,
    type: "number",
    required: false,
  })
  age?: number;

  @ApiProperty({
    description: "Rol del usuario en el sistema",
    example: "admin",
    enum: UserRole,
    type: "string",
  })
  role: UserRole;

  @ApiProperty({
    description: "Fecha de creación del usuario",
    example: "2025-10-01T10:00:00.000Z",
    type: "string",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Fecha de última actualización",
    example: "2025-10-01T10:00:00.000Z",
    type: "string",
  })
  updatedAt: Date;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación de logout",
    example: "Sesión cerrada exitosamente",
    type: "string",
  })
  message: string;

  @ApiProperty({
    description: "Timestamp del logout",
    example: "2025-10-02T13:45:30.123Z",
    type: "string",
  })
  timestamp: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    description: "Mensaje de error de autorización",
    example: "Unauthorized",
    type: "string",
  })
  message: string;

  @ApiProperty({
    description: "Código de estado HTTP",
    example: 401,
    type: "number",
  })
  statusCode: number;
}
