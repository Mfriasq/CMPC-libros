import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";

describe("AppService", () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe("getHello", () => {
    it("should return welcome message", () => {
      const result = service.getHello();
      expect(result).toBe(
        "¡Bienvenido a la API NestJS con TypeScript y PostgreSQL! 🚀"
      );
    });

    it("should always return the same message", () => {
      const result1 = service.getHello();
      const result2 = service.getHello();

      expect(result1).toBe(result2);
      expect(result1).toBe(
        "¡Bienvenido a la API NestJS con TypeScript y PostgreSQL! 🚀"
      );
    });

    it("should return a string", () => {
      const result = service.getHello();
      expect(typeof result).toBe("string");
    });
  });
});
