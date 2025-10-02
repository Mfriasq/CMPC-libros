import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateLibroDto {
  @ApiProperty({
    description: "Título del libro",
    example: "Cien años de soledad",
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiProperty({
    description: "Autor del libro",
    example: "Gabriel García Márquez",
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  autor: string;

  @ApiProperty({
    description: "Editorial del libro",
    example: "Sudamericana",
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  editorial: string;

  @ApiProperty({
    description: "Precio del libro en CLP",
    example: 15990,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  precio: number;

  @ApiProperty({
    description: "Disponibilidad del libro",
    example: true,
  })
  @IsBoolean()
  disponibilidad: boolean;

  @ApiProperty({
    description: "Género del libro",
    example: "Ficción",
    enum: [
      "Ficción",
      "No Ficción",
      "Ciencia Ficción",
      "Romance",
      "Misterio",
      "Biografía",
      "Historia",
      "Poesía",
      "Drama",
      "Ensayo",
    ],
  })
  @IsString()
  @IsIn([
    "Ficción",
    "No Ficción",
    "Ciencia Ficción",
    "Romance",
    "Misterio",
    "Biografía",
    "Historia",
    "Poesía",
    "Drama",
    "Ensayo",
  ])
  genero: string;
}

export class UpdateLibroDto {
  @ApiProperty({
    description: "Título del libro",
    example: "Cien años de soledad",
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({
    description: "Autor del libro",
    example: "Gabriel García Márquez",
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  autor?: string;

  @ApiProperty({
    description: "Editorial del libro",
    example: "Sudamericana",
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  editorial?: string;

  @ApiProperty({
    description: "Precio del libro en CLP",
    example: 15990,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  precio?: number;

  @ApiProperty({
    description: "Disponibilidad del libro",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  disponibilidad?: boolean;

  @ApiProperty({
    description: "Género del libro",
    example: "Ficción",
    required: false,
    enum: [
      "Ficción",
      "No Ficción",
      "Ciencia Ficción",
      "Romance",
      "Misterio",
      "Biografía",
      "Historia",
      "Poesía",
      "Drama",
      "Ensayo",
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    "Ficción",
    "No Ficción",
    "Ciencia Ficción",
    "Romance",
    "Misterio",
    "Biografía",
    "Historia",
    "Poesía",
    "Drama",
    "Ensayo",
  ])
  genero?: string;
}

export class LibroResponseDto {
  @ApiProperty({ description: "ID único del libro" })
  id: number;

  @ApiProperty({ description: "Título del libro" })
  titulo: string;

  @ApiProperty({ description: "Autor del libro" })
  autor: string;

  @ApiProperty({ description: "Editorial del libro" })
  editorial: string;

  @ApiProperty({ description: "Precio del libro en CLP" })
  precio: number;

  @ApiProperty({ description: "Disponibilidad del libro" })
  disponibilidad: boolean;

  @ApiProperty({ description: "Género del libro" })
  genero: string;

  @ApiProperty({ description: "Estado del libro" })
  estado: string;

  @ApiProperty({ description: "Fecha de eliminación", required: false })
  fechaEliminacion?: Date;

  @ApiProperty({ description: "Fecha de restauración", required: false })
  fechaRestauracion?: Date;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt: Date;
}
