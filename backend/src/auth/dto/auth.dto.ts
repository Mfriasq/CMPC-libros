import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import { UserRole } from "../../users/user.model";

export class LoginDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@ejemplo.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "miContraseña123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "Token JWT de acceso",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "Información del usuario autenticado",
  })
  user: {
    id: number;
    email: string;
    name: string;
    age?: number;
    role: UserRole;
  };
}
