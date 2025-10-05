import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsSafeText } from "../../validators/security-validators";
import { IsSafeName } from "../../validators/custom-validators";

export class CreateGeneroDto {
  @ApiProperty({
    description: "Nombre del género literario",
    example: "Ficción Científica",
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: "El nombre del género es requerido" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre contiene caracteres no válidos" })
  nombre: string;

  @ApiPropertyOptional({
    description: "Descripción detallada del género",
    example:
      "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  @MaxLength(500, { message: "La descripción no puede exceder 500 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "La descripción contiene caracteres no permitidos" })
  descripcion?: string;
}

export class UpdateGeneroDto {
  @ApiPropertyOptional({
    description: "Nombre del género literario",
    example: "Ciencia Ficción",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeName({ message: "El nombre contiene caracteres no válidos" })
  nombre?: string;

  @ApiPropertyOptional({
    description: "Descripción detallada del género",
    example:
      "Narrativa que explora las posibilidades científicas y tecnológicas",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  @MaxLength(500, { message: "La descripción no puede exceder 500 caracteres" })
  @Transform(({ value }) => value?.trim())
  @IsSafeText({ message: "La descripción contiene caracteres no permitidos" })
  descripcion?: string;
}

export class GeneroResponseDto {
  @ApiProperty({
    description: "ID único del género",
    example: 1,
    type: "number",
  })
  id: number;

  @ApiProperty({
    description: "Nombre del género literario",
    example: "Ficción Científica",
    type: "string",
  })
  nombre: string;

  @ApiProperty({
    description: "Descripción detallada del género",
    example:
      "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
    type: "string",
    nullable: true,
  })
  descripcion: string | null;

  @ApiProperty({
    description: "Fecha de creación del género",
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

  @ApiProperty({
    description: "Fecha de eliminación (soft delete)",
    example: null,
    type: "string",
    nullable: true,
  })
  deletedAt: Date | null;
}

export class GeneroCreatedResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación",
    example: "Género creado exitosamente",
    type: "string",
  })
  message: string;

  @ApiProperty({
    description: "Datos del género creado",
    type: GeneroResponseDto,
    example: {
      id: 5,
      nombre: "Ficción Científica",
      descripcion:
        "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
      createdAt: "2025-10-02T14:30:00.000Z",
      updatedAt: "2025-10-02T14:30:00.000Z",
      deletedAt: null,
    },
  })
  genero: GeneroResponseDto;
}

export class GeneroOperationResponseDto {
  @ApiProperty({
    description: "Mensaje de confirmación de la operación",
    example: "Género actualizado exitosamente",
    type: "string",
  })
  message: string;

  @ApiProperty({
    description: "Datos del género después de la operación",
    type: GeneroResponseDto,
    example: {
      id: 1,
      nombre: "Ciencia Ficción",
      descripcion:
        "Narrativa que explora las posibilidades científicas y tecnológicas",
      createdAt: "2025-10-01T10:00:00.000Z",
      updatedAt: "2025-10-02T14:30:00.000Z",
      deletedAt: null,
    },
  })
  genero: GeneroResponseDto;
}
