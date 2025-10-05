import {
  Column,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Libro } from "../libros/libro.model";
import { Estado } from "../estados/estado.model";

@Table({
  tableName: "generos",
  timestamps: true,
})
export class Genero extends Model<Genero> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({ description: "ID único del género" })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ description: "Nombre del género", example: "Ficción" })
  nombre: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  @ApiProperty({ description: "Descripción del género", required: false })
  descripcion?: string;

  @ForeignKey(() => Estado)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ApiProperty({ description: "ID del estado del género" })
  estadoId: number;

  @BelongsTo(() => Estado)
  @ApiProperty({ description: "Estado del género" })
  estado: Estado;

  @HasMany(() => Libro)
  libros: Libro[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: "Fecha de eliminación del género",
  })
  @ApiProperty({
    description: "Fecha de eliminación del género",
    example: "2023-12-01T10:30:00Z",
    required: false,
  })
  deletedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: "Fecha de restauración del género eliminado",
  })
  @ApiProperty({
    description: "Fecha de restauración del género eliminado",
    example: "2023-12-01T10:30:00Z",
    required: false,
  })
  restoredAt?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt: Date;
}
