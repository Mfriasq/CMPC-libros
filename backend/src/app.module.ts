import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { LibrosModule } from "./libros/libros.module";
import { GenerosModule } from "./generos/generos.module";
import { AuthModule } from "./auth/auth.module";
import { EstadosModule } from "./estados/estados.module";
import { User } from "./users/user.model";
import { Libro } from "./libros/libro.model";
import { Genero } from "./generos/genero.model";
import { Estado } from "./estados/estado.model";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "admin",
      password: process.env.DB_PASSWORD || "admin",
      database: process.env.DB_NAME || "nestjs_db",
      models: [User, Libro, Genero, Estado],
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    }),
    UsersModule,
    LibrosModule,
    GenerosModule,
    AuthModule,
    EstadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
