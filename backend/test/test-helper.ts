import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";
import * as request from "supertest";
import { TestAppModule } from "./test-app.module";
import { User } from "../src/users/user.model";
import { Estado } from "../src/estados/estado.model";
import { Genero } from "../src/generos/genero.model";
import { UserRole } from "../src/users/user.model";

export class TestHelper {
  static app: INestApplication;
  static sequelize: Sequelize;

  static async setupTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    TestHelper.app = moduleFixture.createNestApplication();

    // Configurar pipes y middleware si es necesario
    // app.useGlobalPipes(new ValidationPipe());

    await TestHelper.app.init();

    // Obtener instancia de Sequelize
    TestHelper.sequelize = TestHelper.app.get(Sequelize);

    return TestHelper.app;
  }

  static async cleanDatabase(): Promise<void> {
    if (TestHelper.sequelize) {
      try {
        // Primero sincronizar las tablas (crearlas si no existen)
        await TestHelper.sequelize.sync({ force: true });

        console.log("✅ Database tables synchronized for testing");
      } catch (error) {
        console.error("❌ Error cleaning/syncing database:", error);
        throw error;
      }
    }
  }

  static async seedDatabase(): Promise<void> {
    if (!TestHelper.sequelize) {
      throw new Error("Database connection not established");
    }

    try {
      // Crear estados básicos
      await TestHelper.sequelize.query(`
        INSERT INTO estados (id, nombre) VALUES 
        (1, 'activo'),
        (2, 'inactivo')
        ON CONFLICT (id) DO NOTHING;
      `);

      // Crear géneros básicos para los tests
      await TestHelper.sequelize.query(`
        INSERT INTO generos (id, nombre, "estadoId", "createdAt", "updatedAt") VALUES 
        (1, 'Ficción', 1, NOW(), NOW()),
        (2, 'No Ficción', 1, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);

      // Crear usuario administrador para tests
      // Contraseña: Password123! (hasheada con bcrypt)
      await TestHelper.sequelize.query(`
        INSERT INTO users (name, email, password, role, age, "estadoId", "createdAt", "updatedAt") 
        VALUES (
          'Admin Test User',
          'admin@biblioteca.com',
          '$2b$10$4sxIwjeoY9Yfbq.kim0pg.mrjFwSmjhedjzZtSiEvNeKusoC6u/RW',
          'admin',
          30,
          1,
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO NOTHING;
      `);

      console.log(
        "✅ Test data seeded successfully (Estados, Géneros, Admin User)"
      );
    } catch (error) {
      console.error("❌ Error seeding test data:", error);
      throw error;
    }
  }

  static async createTestUser(overrides: any = {}): Promise<any> {
    if (!TestHelper.sequelize) {
      throw new Error("Database connection not established");
    }

    const defaultUser = {
      name: "Test User",
      email: "test@biblioteca.com",
      password: "$2a$10$K7L/kxIaKOI5YFyXkgNfSe7H0fjCXQqLOmQ.g4OJrjK/eEQTeQuru", // "Password123!" hasheado
      role: UserRole.USER,
      age: 25,
      estadoId: 1,
      ...overrides,
    };

    // Usar consulta SQL directa
    const result = await TestHelper.sequelize.query(
      `
      INSERT INTO "Users" (name, email, password, role, age, "estadoId", "createdAt", "updatedAt") 
      VALUES (:name, :email, :password, :role, :age, :estadoId, NOW(), NOW())
      RETURNING *;
    `,
      {
        replacements: defaultUser,
        type: QueryTypes.SELECT,
      }
    );

    return result[0];
  }

  static async createTestAdmin(): Promise<any> {
    return await TestHelper.createTestUser({
      name: "Admin User",
      email: "admin@biblioteca.com",
      role: UserRole.ADMIN,
    });
  }

  static async loginUser(
    app: INestApplication,
    email: string,
    password: string
  ): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    return loginResponse.body.access_token;
  }

  static async closeApp(): Promise<void> {
    if (TestHelper.sequelize) {
      await TestHelper.sequelize.close();
    }
    if (TestHelper.app) {
      await TestHelper.app.close();
    }
  }
}
