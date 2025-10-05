import * as winston from "winston";
import "winston-daily-rotate-file";

// Enum para niveles de log personalizados
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  HTTP = "http",
  VERBOSE = "verbose",
  DEBUG = "debug",
  SILLY = "silly",
}

// Enum para categorías de eventos de auditoría
export enum AuditCategory {
  AUTH = "AUTH",
  USER_MANAGEMENT = "USER_MANAGEMENT",
  BOOK_MANAGEMENT = "BOOK_MANAGEMENT",
  GENRE_MANAGEMENT = "GENRE_MANAGEMENT",
  DATA_ACCESS = "DATA_ACCESS",
  SYSTEM = "SYSTEM",
  SECURITY = "SECURITY",
}

// Interface para logs de auditoría estructurados
export interface AuditLogEntry {
  timestamp: string;
  level: LogLevel;
  category: AuditCategory;
  action: string;
  userId?: number;
  userEmail?: string;
  userRole?: string;
  resourceId?: number;
  resourceType?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Configuración de Winston
const createLoggerConfig = () => {
  // Formato personalizado para logs estructurados
  const auditFormat = winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  );

  // Formato para consola (desarrollo)
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      ({
        timestamp,
        level,
        message,
        category,
        action,
        userId,
        success,
        ...meta
      }) => {
        let logMessage = `${timestamp} [${level}]`;

        if (category) logMessage += ` [${category}]`;
        if (action) logMessage += ` ${action}`;
        if (userId) logMessage += ` (User: ${userId})`;
        if (success !== undefined)
          logMessage += ` [${success ? "SUCCESS" : "FAILURE"}]`;

        logMessage += `: ${message}`;

        if (Object.keys(meta).length > 0) {
          try {
            // Función para manejar referencias circulares
            const safeStringify = (obj: any) => {
              const seen = new WeakSet();
              return JSON.stringify(obj, (key, value) => {
                if (typeof value === "object" && value !== null) {
                  if (seen.has(value)) {
                    return "[Circular Reference]";
                  }
                  seen.add(value);
                }
                return value;
              });
            };
            logMessage += ` ${safeStringify(meta)}`;
          } catch (error) {
            logMessage += ` [Error serializing log data: ${error.message}]`;
          }
        }

        return logMessage;
      }
    )
  );

  return {
    level: process.env.LOG_LEVEL || "info",
    format: auditFormat,
    defaultMeta: {
      service: "biblioteca-api",
      environment: process.env.NODE_ENV || "development",
    },
    transports: [
      // Console transport para desarrollo
      new winston.transports.Console({
        format:
          process.env.NODE_ENV === "production" ? auditFormat : consoleFormat,
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
      }),

      // Archivo general para todos los logs
      new winston.transports.DailyRotateFile({
        filename: "logs/application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "info",
      }),

      // Archivo específico para logs de auditoría
      new winston.transports.DailyRotateFile({
        filename: "logs/audit-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "90d", // Mantener auditoría por 90 días
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),

      // Archivo de errores críticos
      new winston.transports.DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
      }),

      // Archivo de seguridad para eventos críticos
      new winston.transports.DailyRotateFile({
        filename: "logs/security-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "365d", // Mantener logs de seguridad por 1 año
        level: "warn",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format((info) => {
            // Solo logs de categoría SECURITY van a este archivo
            return info.category === AuditCategory.SECURITY ? info : false;
          })()
        ),
      }),
    ],

    // Manejo de excepciones no capturadas
    exceptionHandlers: [
      new winston.transports.File({ filename: "logs/exceptions.log" }),
      new winston.transports.Console(),
    ],

    // Manejo de rechazos de promesas no capturadas
    rejectionHandlers: [
      new winston.transports.File({ filename: "logs/rejections.log" }),
      new winston.transports.Console(),
    ],
  };
};

// Crear instancia del logger
export const logger = winston.createLogger(createLoggerConfig());

// Función helper para logs de auditoría
export const auditLog = (entry: Partial<AuditLogEntry>) => {
  const auditEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    level: entry.level || LogLevel.INFO,
    category: entry.category || AuditCategory.SYSTEM,
    action: entry.action || "UNKNOWN_ACTION",
    success: entry.success ?? true,
    ...entry,
  };

  logger.log(auditEntry.level, `${auditEntry.action}`, auditEntry);
};

// Función helper para logs de seguridad
export const securityLog = (
  action: string,
  details: Partial<AuditLogEntry>
) => {
  auditLog({
    ...details,
    category: AuditCategory.SECURITY,
    action,
    level: LogLevel.WARN,
  });
};

export default logger;
