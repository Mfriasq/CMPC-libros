import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  IsEnum,
  isEmail,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../user.model";

export class CreateUserDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@ejemplo.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Nombre del usuario", example: "Juan Pérez" })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "miContraseña123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;

  @ApiProperty({
    description: "Rol del usuario",
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "El rol debe ser user, admin o librarian" })
  role?: UserRole;

  @ApiProperty({
    description: "Edad del usuario",
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;
}

export class UpdateUserDto {
  @ApiProperty({
    description: "Nombre del usuario",
    example: "Juan Pérez",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@usuario.com",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: "Nueva contraseña del usuario",
    example: "nuevaContraseña123",
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password?: string;

  @ApiProperty({
    description: "Rol del usuario",
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "El rol debe ser user, admin o librarian" })
  role?: UserRole;

  @ApiProperty({
    description: "Edad del usuario",
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;
}
