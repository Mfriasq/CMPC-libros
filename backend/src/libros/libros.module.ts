import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LibrosController } from "./libros.controller";
import { LibrosService } from "./libros.service";
import { Libro } from "./libro.model";

@Module({
  imports: [SequelizeModule.forFeature([Libro])],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService],
})
export class LibrosModule {}
