import { sequelizeConfig } from "./database.config";

describe("Database Configuration", () => {
  describe("sequelizeConfig", () => {
    it("should have valid configuration object", () => {
      expect(sequelizeConfig).toBeDefined();
      expect(sequelizeConfig.dialect).toBe("postgres");
    });

    it("should use environment variables or default values", () => {
      // Test default values when env vars are not set
      const originalEnv = process.env;

      // Clear environment variables
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;

      // Re-import to get fresh config
      jest.resetModules();
      const { sequelizeConfig: freshConfig } = require("./database.config");

      expect(freshConfig.host).toBe("localhost");
      expect(freshConfig.port).toBe(5432);
      expect(freshConfig.username).toBe("admin");
      expect(freshConfig.password).toBe("admin");
      expect(freshConfig.database).toBe("nestjs_db");

      // Restore environment
      process.env = originalEnv;
    });

    it("should use environment variables when provided", () => {
      const originalEnv = process.env;

      // Set test environment variables
      process.env.DB_HOST = "test-host";
      process.env.DB_PORT = "3306";
      process.env.DB_USERNAME = "test-user";
      process.env.DB_PASSWORD = "test-password";
      process.env.DB_NAME = "test-database";

      // Re-import to get fresh config
      jest.resetModules();
      const { sequelizeConfig: envConfig } = require("./database.config");

      expect(envConfig.host).toBe("test-host");
      expect(envConfig.port).toBe(3306);
      expect(envConfig.username).toBe("test-user");
      expect(envConfig.password).toBe("test-password");
      expect(envConfig.database).toBe("test-database");

      // Restore environment
      process.env = originalEnv;
    });

    it("should have required models configured", () => {
      expect(sequelizeConfig.models).toBeDefined();
      expect(Array.isArray(sequelizeConfig.models)).toBe(true);
      expect(sequelizeConfig.models.length).toBeGreaterThan(0);
    });

    it("should have development settings", () => {
      expect(sequelizeConfig.autoLoadModels).toBe(true);
      expect(sequelizeConfig.synchronize).toBe(true);
      expect(sequelizeConfig.logging).toBe(false);
    });

    it("should handle invalid port environment variable", () => {
      const originalEnv = process.env;

      // Set invalid port
      process.env.DB_PORT = "invalid-port";

      // Re-import to get fresh config
      jest.resetModules();
      const {
        sequelizeConfig: invalidPortConfig,
      } = require("./database.config");

      // Should fall back to default port when parseInt returns NaN
      expect(invalidPortConfig.port).toBe(5432);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe("Configuration Validation", () => {
    it("should have all required database configuration properties", () => {
      const requiredProperties = [
        "dialect",
        "host",
        "port",
        "username",
        "password",
        "database",
        "models",
        "autoLoadModels",
        "synchronize",
        "logging",
      ];

      requiredProperties.forEach((property) => {
        expect(sequelizeConfig).toHaveProperty(property);
      });
    });

    it("should use PostgreSQL dialect", () => {
      expect(sequelizeConfig.dialect).toBe("postgres");
    });

    it("should have valid port number", () => {
      expect(typeof sequelizeConfig.port).toBe("number");
      expect(sequelizeConfig.port).toBeGreaterThan(0);
      expect(sequelizeConfig.port).toBeLessThanOrEqual(65535);
    });

    it("should have valid host string", () => {
      expect(typeof sequelizeConfig.host).toBe("string");
      expect(sequelizeConfig.host.length).toBeGreaterThan(0);
    });

    it("should have credentials configured", () => {
      expect(typeof sequelizeConfig.username).toBe("string");
      expect(typeof sequelizeConfig.password).toBe("string");
      expect(typeof sequelizeConfig.database).toBe("string");

      expect(sequelizeConfig.username.length).toBeGreaterThan(0);
      expect(sequelizeConfig.database.length).toBeGreaterThan(0);
    });
  });
});
