import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../src/users/user.model";
import { Libro } from "../src/libros/libro.model";
import { Genero } from "../src/generos/genero.model";
import { Estado } from "../src/estados/estado.model";

export const TestDatabaseModule = SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    dialect: "postgres",
    host: configService.get("DB_HOST", "localhost"),
    port: configService.get("DB_PORT", 5432),
    username: configService.get("DB_USERNAME", "postgres"),
    password: configService.get("DB_PASSWORD", "postgres"),
    database: configService.get("DB_NAME_TEST", "biblioteca_test"), // Base de datos separada para tests
    models: [User, Libro, Genero, Estado],
    autoLoadModels: true,
    synchronize: true, // Solo para tests - recrea las tablas
    logging: false, // Desactivar logs SQL durante tests
    // Configuraciones específicas para tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }),
});
