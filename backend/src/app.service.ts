import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "¡Bienvenido a la API NestJS con TypeScript y PostgreSQL! 🚀";
  }
}
