#!/usr/bin/env node

/**
 * 🧪 Script de Prueba Automatizada - Flujo de Subida de Imágenes
 *
 * Este script realiza pruebas automatizadas del sistema de subida de imágenes
 * para verificar que todos los componentes funcionen correctamente.
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Configuración
const API_BASE = "http://localhost:3001";
const FRONTEND_BASE = "http://localhost:3000";

// Colores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

class ImageUploadTester {
  constructor() {
    this.token = null;
    this.testBookId = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runTest(name, testFunction) {
    try {
      this.log(`\n🧪 Testing: ${name}`, "blue");
      await testFunction();
      this.log(`✅ PASS: ${name}`, "green");
      this.results.passed++;
      this.results.tests.push({ name, status: "PASS" });
    } catch (error) {
      this.log(`❌ FAIL: ${name} - ${error.message}`, "red");
      this.results.failed++;
      this.results.tests.push({ name, status: "FAIL", error: error.message });
    }
  }

  // Test 1: Autenticación
  async testAuthentication() {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@biblioteca.com",
      password: "admin123",
    });

    if (response.data.data && response.data.data.access_token) {
      this.token = response.data.data.access_token;
      this.log("Token obtenido correctamente", "green");
    } else {
      throw new Error("No se obtuvo token de acceso");
    }
  }

  // Test 2: Crear libro para pruebas
  async testCreateTestBook() {
    const timestamp = Date.now();
    const bookData = {
      titulo: `Test Book - Image Upload - ${timestamp}`,
      autor: "Test Author",
      editorial: "Test Editorial",
      precio: 25000,
      disponibilidad: 10,
      generoId: 1, // Asumiendo que existe género con ID 1
    };

    const response = await axios.post(`${API_BASE}/libros`, bookData, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (response.data.data && response.data.data.id) {
      this.testBookId = response.data.data.id;
      this.log(`Libro de prueba creado con ID: ${this.testBookId}`, "green");
    } else {
      throw new Error("No se pudo crear libro de prueba");
    }
  }

  // Test 3: Crear imagen de prueba
  async createTestImage() {
    // Crear una imagen simple de 1x1 pixel en formato PNG (base64)
    const pngData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );

    const testImagePath = path.join(__dirname, "test-image.png");
    fs.writeFileSync(testImagePath, pngData);
    return testImagePath;
  }

  // Test 4: Subida de imagen válida
  async testValidImageUpload() {
    const testImagePath = await this.createTestImage();

    try {
      const formData = new FormData();
      formData.append("imagen", fs.createReadStream(testImagePath));

      const response = await axios.post(
        `${API_BASE}/libros/${this.testBookId}/imagen`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (response.data && response.data.imagenUrl) {
        this.log(
          `Imagen subida exitosamente: ${response.data.imagenUrl}`,
          "green"
        );
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.imagenUrl
      ) {
        this.log(
          `Imagen subida exitosamente: ${response.data.data.imagenUrl}`,
          "green"
        );
      } else {
        console.log(
          "Respuesta recibida:",
          JSON.stringify(response.data, null, 2)
        );
        throw new Error("Respuesta no contiene imagenUrl");
      }
    } finally {
      // Limpiar archivo de prueba
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  }

  // Test 5: Subida sin archivo
  async testUploadWithoutFile() {
    try {
      const formData = new FormData();

      await axios.post(
        `${API_BASE}/libros/${this.testBookId}/imagen`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      throw new Error("Debería haber fallado sin archivo");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log("Error 400 correcto al subir sin archivo", "green");
      } else {
        throw error;
      }
    }
  }

  // Test 6: Subida sin autenticación
  async testUploadWithoutAuth() {
    const testImagePath = await this.createTestImage();

    try {
      const formData = new FormData();
      formData.append("imagen", fs.createReadStream(testImagePath));

      await axios.post(
        `${API_BASE}/libros/${this.testBookId}/imagen`,
        formData,
        {
          headers: formData.getHeaders(),
          // Sin Authorization header
        }
      );

      throw new Error("Debería haber fallado sin autenticación");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.log("Error 401 correcto al subir sin autenticación", "green");
      } else {
        throw error;
      }
    } finally {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  }

  // Test 7: Verificar archivo estático
  async testStaticFileAccess() {
    // Intentar acceder a una imagen existente
    const response = await axios.get(
      `${API_BASE}/uploads/libros/libro-blanco.jpg`
    );

    if (
      response.status === 200 &&
      response.headers["content-type"].startsWith("image/")
    ) {
      this.log("Archivo estático accesible correctamente", "green");
    } else {
      throw new Error("No se puede acceder a archivos estáticos");
    }
  }

  // Test 8: Verificar estructura de directorio
  async testDirectoryStructure() {
    const uploadsDir = path.join(__dirname, "backend", "uploads", "libros");

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      this.log(
        `Directorio uploads existe con ${files.length} archivos`,
        "green"
      );
    } else {
      throw new Error("Directorio uploads/libros no existe");
    }
  }

  // Test 9: Subida de archivo malicioso (.exe)
  async testMaliciousFileUpload() {
    const maliciousFilePath = path.join(__dirname, "test-malicious.exe");

    try {
      const formData = new FormData();
      formData.append("imagen", fs.createReadStream(maliciousFilePath));

      await axios.post(
        `${API_BASE}/libros/${this.testBookId}/imagen`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      throw new Error("Debería haber rechazado el archivo .exe");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log("✅ Backend correctamente rechazó archivo .exe", "green");
      } else {
        throw error;
      }
    }
  }

  // Limpiar datos de prueba
  async cleanup() {
    if (this.testBookId && this.token) {
      try {
        await axios.delete(`${API_BASE}/libros/${this.testBookId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.log("Libro de prueba eliminado", "yellow");
      } catch (error) {
        this.log("Error al limpiar libro de prueba", "yellow");
      }
    }
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    this.log("🚀 Iniciando pruebas de subida de imágenes...", "blue");

    await this.runTest("Autenticación", () => this.testAuthentication());
    await this.runTest("Crear libro de prueba", () =>
      this.testCreateTestBook()
    );
    await this.runTest("Subida de imagen válida", () =>
      this.testValidImageUpload()
    );
    await this.runTest("Subida sin archivo", () =>
      this.testUploadWithoutFile()
    );
    await this.runTest("Subida sin autenticación", () =>
      this.testUploadWithoutAuth()
    );
    await this.runTest("Acceso a archivo estático", () =>
      this.testStaticFileAccess()
    );
    await this.runTest("Estructura de directorio", () =>
      this.testDirectoryStructure()
    );
    await this.runTest("Subida de archivo malicioso", () =>
      this.testMaliciousFileUpload()
    );

    await this.cleanup();

    this.showResults();
  }

  showResults() {
    this.log("\n📊 RESULTADOS DE PRUEBAS", "blue");
    this.log("========================", "blue");
    this.log(`✅ Pruebas exitosas: ${this.results.passed}`, "green");
    this.log(`❌ Pruebas fallidas: ${this.results.failed}`, "red");
    this.log(`📝 Total de pruebas: ${this.results.tests.length}`, "blue");

    if (this.results.failed > 0) {
      this.log("\n❌ PRUEBAS FALLIDAS:", "red");
      this.results.tests
        .filter((test) => test.status === "FAIL")
        .forEach((test) => {
          this.log(`  - ${test.name}: ${test.error}`, "red");
        });
    }

    const successRate = (
      (this.results.passed / this.results.tests.length) *
      100
    ).toFixed(1);
    this.log(
      `\n🎯 Tasa de éxito: ${successRate}%`,
      successRate > 90 ? "green" : "yellow"
    );
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  const tester = new ImageUploadTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ImageUploadTester;
