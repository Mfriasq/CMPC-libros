import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TestDatabaseModule } from "./test-database.config";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { LibrosModule } from "../src/libros/libros.module";
import { GenerosModule } from "../src/generos/generos.module";
import { EstadosModule } from "../src/estados/estados.module";
import { LoggingModule } from "../src/logging/logging.module";

@Module({
  imports: [
    // Configuración de entorno para tests
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.test", // Archivo de entorno específico para tests
    }),
    // Base de datos de test
    TestDatabaseModule,
    // Logging para tests
    LoggingModule,
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    LibrosModule,
    GenerosModule,
    EstadosModule,
  ],
})
export class TestAppModule {}
