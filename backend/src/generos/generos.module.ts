import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GenerosService } from "./generos.service";
import { GenerosController } from "./generos.controller";
import { Genero } from "./genero.model";
import { EstadosModule } from "../estados/estados.module";

@Module({
  imports: [SequelizeModule.forFeature([Genero]), EstadosModule],
  controllers: [GenerosController],
  providers: [GenerosService],
  exports: [GenerosService],
})
export class GenerosModule {}
