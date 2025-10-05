import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoggingService } from "./logging.service";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let details: any = {};

    // Determinar tipo de error y extraer información
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = {
        name: exception.name,
        stack: exception.stack,
      };
    }

    // Log del error según severidad
    const errorLevel = this.getErrorLevel(status);
    const isSecurityRelevant = this.isSecurityRelevantError(
      status,
      request.url
    );

    // Log de error estándar
    this.loggingService.logSystemError(
      exception instanceof Error ? exception : new Error(message),
      `GlobalExceptionFilter`,
      request.user?.id,
      request
    );

    // Log de seguridad si es relevante
    if (isSecurityRelevant) {
      this.loggingService.auditSecurity(
        this.getSecurityEventType(status),
        {
          statusCode: status,
          message,
          endpoint: request.url,
          method: request.method,
          details: this.sanitizeErrorDetails(details),
          userAgent: request.get("User-Agent"),
          timestamp: new Date().toISOString(),
        },
        request,
        request.user?.id
      );
    }

    // Preparar respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === "development" && {
        details: this.sanitizeErrorDetails(details),
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorLevel(status: number): "error" | "warn" | "info" {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "info";
  }

  private isSecurityRelevantError(status: number, url: string): boolean {
    // Errores de seguridad
    const securityStatusCodes = [401, 403, 404, 429, 422];

    // Endpoints críticos
    const criticalEndpoints = ["/auth/", "/users/", "/admin"];

    return (
      securityStatusCodes.includes(status) ||
      criticalEndpoints.some((endpoint) => url.includes(endpoint))
    );
  }

  private getSecurityEventType(status: number): string {
    switch (status) {
      case 401:
        return "UNAUTHORIZED_ACCESS_ATTEMPT";
      case 403:
        return "FORBIDDEN_ACCESS_ATTEMPT";
      case 404:
        return "RESOURCE_NOT_FOUND_ACCESS";
      case 429:
        return "RATE_LIMIT_EXCEEDED";
      case 422:
        return "INVALID_DATA_SUBMISSION";
      default:
        return "SECURITY_ERROR";
    }
  }

  private sanitizeErrorDetails(details: any): any {
    if (!details || typeof details !== "object") return details;

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...details };

    // Recursivamente sanitizar campos sensibles
    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;

      const result: any = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          result[key] = "[REDACTED]";
        } else if (typeof value === "object" && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }
}
