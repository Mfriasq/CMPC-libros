import { Test, TestingModule } from "@nestjs/testing";
import { LoggingService } from "./logging.service";

// Mock del logger
jest.mock("./logger.config", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  },
  auditLog: jest.fn(),
  securityLog: jest.fn(),
  AuditCategory: {
    AUTH: "AUTH",
    USER_MANAGEMENT: "USER_MANAGEMENT",
    BOOK_MANAGEMENT: "BOOK_MANAGEMENT",
    GENRE_MANAGEMENT: "GENRE_MANAGEMENT",
    DATA_ACCESS: "DATA_ACCESS",
    SECURITY: "SECURITY",
    SYSTEM: "SYSTEM",
  },
  LogLevel: {
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    DEBUG: "debug",
  },
}));

describe("LoggingService", () => {
  let service: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingService],
    }).compile();

    service = module.get<LoggingService>(LoggingService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("basic logging methods", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should log info messages", () => {
      const { logger } = require("./logger.config");
      service.log("Test message", "TestContext");
      expect(logger.info).toHaveBeenCalledWith("Test message", {
        context: "TestContext",
      });
    });

    it("should log error messages", () => {
      const { logger } = require("./logger.config");
      service.error("Error message", "Stack trace", "TestContext");
      expect(logger.error).toHaveBeenCalledWith("Error message", {
        trace: "Stack trace",
        context: "TestContext",
      });
    });

    it("should log warning messages", () => {
      const { logger } = require("./logger.config");
      service.warn("Warning message", "TestContext");
      expect(logger.warn).toHaveBeenCalledWith("Warning message", {
        context: "TestContext",
      });
    });

    it("should log debug messages", () => {
      const { logger } = require("./logger.config");
      service.debug("Debug message", "TestContext");
      expect(logger.debug).toHaveBeenCalledWith("Debug message", {
        context: "TestContext",
      });
    });

    it("should log verbose messages", () => {
      const { logger } = require("./logger.config");
      service.verbose("Verbose message", "TestContext");
      expect(logger.verbose).toHaveBeenCalledWith("Verbose message", {
        context: "TestContext",
      });
    });
  });

  describe("service methods exist", () => {
    it("should have all audit methods defined", () => {
      expect(typeof service.auditAuth).toBe("function");
      expect(typeof service.auditUserManagement).toBe("function");
      expect(typeof service.auditBookManagement).toBe("function");
      expect(typeof service.auditDataAccess).toBe("function");
      expect(typeof service.logSystemError).toBe("function");
    });
  });
});
