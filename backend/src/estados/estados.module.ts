import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { EstadosController } from "./estados.controller";
import { EstadosService } from "./estados.service";
import { Estado } from "./estado.model";

@Module({
  imports: [SequelizeModule.forFeature([Estado])],
  controllers: [EstadosController],
  providers: [EstadosService],
  exports: [EstadosService],
})
export class EstadosModule {}
