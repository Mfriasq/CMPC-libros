import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./user.model";
import { EstadosModule } from "../estados/estados.module";

@Module({
  imports: [SequelizeModule.forFeature([User]), EstadosModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
