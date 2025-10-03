import {
  IsString,
  IsInt,
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
    description: "Cantidad de ejemplares disponibles",
    example: 5,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  disponibilidad: number;

  @ApiProperty({
    description: "ID del género del libro",
    example: 1,
  })
  @IsInt()
  @Min(1)
  generoId: number;

  @ApiProperty({
    description: "URL de la imagen del libro",
    example: "/uploads/libros/libro-123.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagenUrl?: string;
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
    description: "Cantidad de ejemplares disponibles",
    example: 3,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  disponibilidad?: number;

  @ApiProperty({
    description: "ID del género del libro",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  generoId?: number;

  @ApiProperty({
    description: "URL de la imagen del libro",
    example: "/uploads/libros/libro-123.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagenUrl?: string;
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

  @ApiProperty({ description: "Cantidad de ejemplares disponibles" })
  disponibilidad: number;

  @ApiProperty({ description: "ID del género" })
  generoId: number;

  @ApiProperty({ description: "Información del género" })
  genero: {
    id: number;
    nombre: string;
    descripcion?: string;
  };

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

  @ApiProperty({ description: "URL de la imagen del libro", required: false })
  imagenUrl?: string;
}
