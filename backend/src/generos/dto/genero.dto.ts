import { IsString, IsBoolean, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGeneroDto {
  @ApiProperty({
    description: "Nombre del género",
    example: "Ficción Científica",
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: "Descripción del género",
    example:
      "Narrativa que se desarrolla en un marco imaginario cuyas bases se encuentran en la ciencia",
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateGeneroDto {
  @ApiProperty({
    description: "Nombre del género",
    example: "Ciencia Ficción",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiProperty({
    description: "Descripción del género",
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
