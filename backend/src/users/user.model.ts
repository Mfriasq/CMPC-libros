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

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  LIBRARIAN = "librarian",
}

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({ description: "ID único del usuario" })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ description: "Email del usuario" })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: "Nombre del usuario" })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  @ApiProperty({ description: "Edad del usuario", required: false })
  age?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string; // No incluir en ApiProperty por seguridad

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  @ApiProperty({
    description: "Rol del usuario",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreatedAt
  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @UpdatedAt
  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt: Date;
}
