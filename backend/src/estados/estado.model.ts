import {
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/user.model";

@Table({
  tableName: "estados",
  timestamps: false, // Sin timestamps
})
export class Estado extends Model<Estado> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({ description: "ID único del estado" })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ description: "Nombre del estado" })
  nombre: string;

  // Relación con usuarios
  @HasMany(() => User)
  usuarios: User[];
}
