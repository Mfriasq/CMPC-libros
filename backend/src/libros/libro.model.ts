import {
  Column,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Genero } from "../generos/genero.model";
import { Estado } from "../estados/estado.model";

@Table({
  tableName: "libros",
  timestamps: true,
})
export class Libro extends Model<Libro> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({ description: "ID único del libro" })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ description: "Título del libro" })
  titulo: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: "Autor del libro" })
  autor: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: "Editorial del libro", required: true })
  editorial: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ApiProperty({ description: "Precio del libro", required: true })
  precio: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  @ApiProperty({
    description: "Cantidad de ejemplares disponibles",
    required: true,
  })
  disponibilidad: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  @ApiProperty({
    description: "URL de la imagen del libro",
    required: false,
    example: "/uploads/libros/libro-123.jpg",
  })
  imagenUrl?: string;

  @ForeignKey(() => Genero)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ApiProperty({ description: "ID del género del libro" })
  generoId: number;

  @BelongsTo(() => Genero)
  genero: Genero;

  @ForeignKey(() => Estado)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ApiProperty({ description: "ID del estado del libro" })
  estadoId: number;

  @BelongsTo(() => Estado)
  @ApiProperty({ description: "Estado del libro" })
  estado: Estado;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ description: "Fecha de restauración", required: false })
  restoredAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ description: "Fecha de eliminación lógica", required: false })
  deletedAt?: Date;

  @CreatedAt
  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @UpdatedAt
  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt: Date;
}
