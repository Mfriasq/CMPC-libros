import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TestHelper } from "./test-helper";
import { UserRole } from "../src/users/user.model";
import { ValidationPipe } from "@nestjs/common";

describe("Integration Tests - Login → Create Book → List Books", () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Configurar la aplicación de test
    app = await TestHelper.setupTestApp();

    // Agregar pipes de validación
    app.useGlobalPipes(new ValidationPipe());

    // Limpiar y sembrar la base de datos con usuario admin
    await TestHelper.cleanDatabase();
    await TestHelper.seedDatabase();

    console.log("✅ Test setup completed with admin user created");
  });

  afterAll(async () => {
    await TestHelper.closeApp();
  });

  it("should complete full workflow: login → create book → list books", async () => {
    // PASO 1: Login con usuario admin creado via SQL
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "admin@biblioteca.com",
        password: "Password123!",
      })
      .expect(200);

    const token = loginResponse.body.access_token;
    expect(token).toBeDefined();
    expect(loginResponse.body.user.email).toBe("admin@biblioteca.com");
    expect(loginResponse.body.user.role).toBe("admin");

    console.log("✅ Admin login successful");
    console.log("Token:", token.substring(0, 50) + "...");

    // PASO 2: Crear un nuevo libro (usando género pre-creado)
    const newBook = {
      titulo: "El Quijote de la Mancha",
      autor: "Miguel de Cervantes",
      editorial: "Editorial Planeta",
      precio: 29990,
      disponibilidad: 10,
      generoId: 1, // Género "Ficción" creado en seedDatabase
    };

    const createBookResponse = await request(app.getHttpServer())
      .post("/libros")
      .set("Authorization", `Bearer ${token}`)
      .send(newBook);

    console.log("Create book response status:", createBookResponse.status);
    console.log("Create book response body:", createBookResponse.body);

    expect(createBookResponse.status).toBe(201);

    expect(createBookResponse.body).toHaveProperty("id");
    expect(createBookResponse.body.titulo).toBe(newBook.titulo);
    expect(createBookResponse.body.autor).toBe(newBook.autor);
    expect(createBookResponse.body.precio).toBe(newBook.precio);

    const createdBookId = createBookResponse.body.id;
    console.log(`✅ Book created with ID: ${createdBookId}`);

    // PASO 3: Listar libros y verificar que el libro creado aparezca
    const listBooksResponse = await request(app.getHttpServer())
      .get("/libros")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listBooksResponse.body).toHaveProperty("data");
    expect(listBooksResponse.body).toHaveProperty("total");
    expect(listBooksResponse.body.total).toBeGreaterThanOrEqual(1);

    // Verificar que nuestro libro está en la lista
    const foundBook = listBooksResponse.body.data.find(
      (book) => book.id === createdBookId
    );
    expect(foundBook).toBeDefined();
    expect(foundBook.titulo).toBe(newBook.titulo);

    console.log("✅ Book found in list");

    // PASO 4: Obtener libro por ID
    const getBookResponse = await request(app.getHttpServer())
      .get(`/libros/${createdBookId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(getBookResponse.body.id).toBe(createdBookId);
    expect(getBookResponse.body.titulo).toBe(newBook.titulo);

    console.log("✅ Book retrieved by ID successfully");

    console.log(
      "🎉 INTEGRATION TEST PASSED: Complete workflow login → create book → list books"
    );
  });

  it("should handle authentication errors correctly", async () => {
    // Test login con credenciales inválidas
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "admin@biblioteca.com",
        password: "wrongpassword",
      })
      .expect(401);

    // Test acceso sin token
    await request(app.getHttpServer())
      .post("/libros")
      .send({
        titulo: "Libro sin auth",
        autor: "Autor",
        editorial: "Editorial",
        precio: 10000,
        disponibilidad: 5,
        generoId: 1,
      })
      .expect(401);

    console.log("✅ Authentication security tests passed");
  });
});
