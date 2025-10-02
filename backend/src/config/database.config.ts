import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { User } from "../users/user.model";

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "nestjs_db",
  models: [User],
  autoLoadModels: true,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
