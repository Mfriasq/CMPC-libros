import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { MulterModule } from "@nestjs/platform-express";
import { LibrosController } from "./libros.controller";
import { LibrosService } from "./libros.service";
import { Libro } from "./libro.model";
import { EstadosModule } from "../estados/estados.module";
import { MulterConfigService } from "./multer-config.service";

@Module({
  imports: [
    SequelizeModule.forFeature([Libro]),
    EstadosModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [LibrosController],
  providers: [LibrosService, MulterConfigService],
  exports: [LibrosService],
})
export class LibrosModule {}
