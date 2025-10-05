import { Injectable } from "@nestjs/common";
import {
  logger,
  auditLog,
  securityLog,
  AuditCategory,
  LogLevel,
  AuditLogEntry,
} from "./logger.config";

@Injectable()
export class LoggingService {
  // Logging básico
  log(message: string, context?: string) {
    logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    logger.verbose(message, { context });
  }

  // Logging de auditoría específico
  auditAuth(
    action: string,
    userId?: number,
    userEmail?: string,
    success: boolean = true,
    details?: any,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.AUTH,
      action,
      userId,
      userEmail,
      success,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: success ? LogLevel.INFO : LogLevel.WARN,
    });
  }

  auditUserManagement(
    action: string,
    adminId: number,
    adminEmail: string,
    targetUserId?: number,
    success: boolean = true,
    details?: any,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.USER_MANAGEMENT,
      action,
      userId: adminId,
      userEmail: adminEmail,
      resourceId: targetUserId,
      resourceType: "User",
      success,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: success ? LogLevel.INFO : LogLevel.WARN,
    });
  }

  auditBookManagement(
    action: string,
    userId: number,
    userEmail: string,
    userRole: string,
    bookId?: number,
    success: boolean = true,
    details?: any,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.BOOK_MANAGEMENT,
      action,
      userId,
      userEmail,
      userRole,
      resourceId: bookId,
      resourceType: "Book",
      success,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: success ? LogLevel.INFO : LogLevel.WARN,
    });
  }

  auditGenreManagement(
    action: string,
    userId: number,
    userEmail: string,
    userRole: string,
    genreId?: number,
    success: boolean = true,
    details?: any,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.GENRE_MANAGEMENT,
      action,
      userId,
      userEmail,
      userRole,
      resourceId: genreId,
      resourceType: "Genre",
      success,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: success ? LogLevel.INFO : LogLevel.WARN,
    });
  }

  auditDataAccess(
    action: string,
    userId?: number,
    userEmail?: string,
    resourceType?: string,
    filters?: any,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.DATA_ACCESS,
      action,
      userId,
      userEmail,
      resourceType,
      success: true,
      details: { filters },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: LogLevel.INFO,
    });
  }

  auditSecurity(action: string, details: any, req?: any, userId?: number) {
    securityLog(action, {
      userId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: LogLevel.WARN,
    });
  }

  auditSystem(
    action: string,
    userId?: number,
    userEmail?: string,
    success: boolean = true,
    details?: any,
    req?: any
  ) {
    // Para registrar eventos del sistema (endpoints no categorizados específicamente)
    auditLog({
      category: AuditCategory.SYSTEM,
      action,
      userId,
      userEmail,
      success,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: success ? LogLevel.INFO : LogLevel.WARN,
    });
  }

  // Logging de rendimiento
  logPerformance(
    operation: string,
    duration: number,
    userId?: number,
    details?: any
  ) {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO; // Warn si toma más de 5s

    auditLog({
      category: AuditCategory.SYSTEM,
      action: `PERFORMANCE_${operation.toUpperCase()}`,
      userId,
      success: true,
      duration,
      details,
      level,
      metadata: {
        performanceThreshold: 5000,
        actualDuration: duration,
      },
    });
  }

  // Logging de errores de sistema
  logSystemError(error: Error, context?: string, userId?: number, req?: any) {
    auditLog({
      category: AuditCategory.SYSTEM,
      action: "SYSTEM_ERROR",
      userId,
      success: false,
      errorMessage: error.message,
      details: {
        stack: error.stack,
        context,
        name: error.name,
      },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      level: LogLevel.ERROR,
    });
  }

  // Helper para crear contexto de request
  private createRequestContext(req: any): Partial<AuditLogEntry> {
    return {
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
      metadata: {
        method: req?.method,
        url: req?.url,
        params: req?.params,
        query: req?.query,
      },
    };
  }

  // Logging de cambios en datos sensibles
  logDataChange(
    operation: "CREATE" | "UPDATE" | "DELETE" | "RESTORE",
    resourceType: string,
    resourceId: number,
    oldData: any,
    newData: any,
    userId: number,
    userEmail: string,
    req?: any
  ) {
    auditLog({
      category: AuditCategory.DATA_ACCESS,
      action: `${operation}_${resourceType.toUpperCase()}`,
      userId,
      userEmail,
      resourceId,
      resourceType,
      success: true,
      details: {
        operation,
        oldData: this.sanitizeData(oldData),
        newData: this.sanitizeData(newData),
        changes: this.calculateChanges(oldData, newData),
      },
      ...this.createRequestContext(req),
      level: LogLevel.INFO,
    });
  }

  // Sanitizar datos sensibles antes del logging
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ["password", "token", "secret", "key"];
    const sanitized = { ...data };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  // Calcular cambios entre objetos para auditoría
  private calculateChanges(oldData: any, newData: any): any {
    if (!oldData || !newData) return null;

    const changes: any = {};

    Object.keys(newData).forEach((key) => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key],
        };
      }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  }
}
