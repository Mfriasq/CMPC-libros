import {
  Column,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

export enum EstadoLibro {
  ACTIVO = "activo",
  ELIMINADO = "eliminado",
}

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
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  disponibilidad: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  genero: string;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoLibro)),
    allowNull: false,
    defaultValue: EstadoLibro.ACTIVO,
  })
  @ApiProperty({
    description: "Estado del libro",
    enum: EstadoLibro,
    default: EstadoLibro.ACTIVO,
  })
  estado: EstadoLibro;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ description: "Fecha de eliminación", required: false })
  fechaEliminacion?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ description: "Fecha de restauración", required: false })
  fechaRestauracion?: Date;

  @CreatedAt
  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @UpdatedAt
  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt: Date;
}
