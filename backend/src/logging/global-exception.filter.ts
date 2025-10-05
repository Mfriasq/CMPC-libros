import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ValidationError } from "class-validator";
import { LoggingService } from "./logging.service";

// Interfaces para tipado fuerte
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  details?: any;
  correlationId: string;
}

interface ErrorContext {
  request: Request & { user?: any };
  response: Response;
  exception: unknown;
  status: number;
  correlationId: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    // Generar ID único para correlación de errores
    const correlationId = this.generateCorrelationId();

    // Determinar contexto del error
    const errorContext: ErrorContext = {
      request,
      response,
      exception,
      status: this.extractStatus(exception),
      correlationId,
    };

    // Procesar error y generar respuesta
    const errorResponse = this.processException(errorContext);

    // Logging comprehensivo
    this.logError(errorContext, errorResponse);

    // Enviar respuesta al cliente
    response.status(errorContext.status).json(errorResponse);
  }

  private processException(context: ErrorContext): ErrorResponse {
    const { exception, request, status, correlationId } = context;

    // Extraer información base del error
    const baseError = this.extractErrorInfo(exception);

    // Crear respuesta estandarizada
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: baseError.message,
      error: baseError.error,
      correlationId,
    };

    // Agregar detalles según el entorno y tipo de error
    if (this.shouldIncludeDetails(status)) {
      errorResponse.details = this.sanitizeErrorDetails(baseError.details);
    }

    return errorResponse;
  }

  private extractErrorInfo(exception: unknown): {
    message: string;
    error: string;
    details?: any;
  } {
    // HttpException (BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "string") {
        return {
          message: response,
          error: exception.constructor.name,
        };
      }

      if (typeof response === "object") {
        const responseObj = response as any;
        return {
          message: responseObj.message || exception.message,
          error: responseObj.error || exception.constructor.name,
          details: responseObj,
        };
      }
    }

    // ValidationError (class-validator)
    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      return {
        message: "Validation failed",
        error: "ValidationError",
        details: this.formatValidationErrors(exception),
      };
    }

    // Error genérico de JavaScript
    if (exception instanceof Error) {
      return {
        message: exception.message || "An unexpected error occurred",
        error: exception.constructor.name,
        details: {
          name: exception.name,
          stack:
            process.env.NODE_ENV === "development"
              ? exception.stack
              : undefined,
        },
      };
    }

    // Error desconocido
    return {
      message: "An unexpected error occurred",
      error: "UnknownError",
      details: { exception: String(exception) },
    };
  }

  private extractStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Mapear errores específicos a códigos HTTP
    if (exception instanceof Error) {
      switch (exception.constructor.name) {
        case "ValidationError":
        case "CastError":
          return HttpStatus.BAD_REQUEST;
        case "UnauthorizedError":
        case "JsonWebTokenError":
        case "TokenExpiredError":
          return HttpStatus.UNAUTHORIZED;
        case "ForbiddenError":
          return HttpStatus.FORBIDDEN;
        case "NotFoundError":
          return HttpStatus.NOT_FOUND;
        case "ConflictError":
        case "SequelizeUniqueConstraintError":
          return HttpStatus.CONFLICT;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldIncludeDetails(status: number): boolean {
    // Incluir detalles en desarrollo o para errores de validación
    return (
      process.env.NODE_ENV === "development" ||
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.UNPROCESSABLE_ENTITY
    );
  }

  private formatValidationErrors(validationErrors: ValidationError[]): any {
    const formatError = (error: ValidationError): any => {
      // Lista de campos sensibles que no deben mostrar sus valores
      const sensitiveFields = ['password', 'confirmPassword', 'currentPassword', 'newPassword'];
      const isSensitive = sensitiveFields.includes(error.property);

      const result: any = {
        property: error.property,
        value: isSensitive ? '[REDACTED]' : error.value,
        constraints: error.constraints || {},
      };

      if (error.children && error.children.length > 0) {
        result.children = error.children.map(formatError);
      }

      return result;
    };

    return validationErrors.map(formatError);
  }

  private logError(context: ErrorContext, errorResponse: ErrorResponse): void {
    const { exception, request, status } = context;
    const { correlationId } = errorResponse;

    // Determinar nivel de severidad
    const errorLevel = this.getErrorLevel(status);
    const isSecurityRelevant = this.isSecurityRelevantError(
      status,
      request.url
    );

    // Log de error estándar con correlationId
    this.loggingService.logSystemError(
      exception instanceof Error ? exception : new Error(errorResponse.message),
      `GlobalExceptionFilter [${correlationId}]`,
      request.user?.id,
      request
    );

    // Log de seguridad si es relevante
    if (isSecurityRelevant) {
      this.loggingService.auditSecurity(
        this.getSecurityEventType(status),
        {
          correlationId,
          statusCode: status,
          message: errorResponse.message,
          error: errorResponse.error,
          endpoint: request.url,
          method: request.method,
          userAgent: request.get("User-Agent"),
          timestamp: errorResponse.timestamp,
          details: this.sanitizeErrorDetails(errorResponse.details),
        },
        request,
        request.user?.id
      );
    }

    // Log específico según tipo de error
    this.logSpecificErrorType(context, errorResponse);
  }

  private logSpecificErrorType(
    context: ErrorContext,
    errorResponse: ErrorResponse
  ): void {
    const { exception, request, status } = context;
    const { correlationId } = errorResponse;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        this.loggingService.warn(
          `Bad Request [${correlationId}]: ${errorResponse.message}`,
          "GlobalExceptionFilter"
        );
        break;

      case HttpStatus.UNAUTHORIZED:
        this.loggingService.auditSecurity(
          "AUTHENTICATION_FAILURE",
          {
            correlationId,
            endpoint: request.url,
            method: request.method,
            message: errorResponse.message,
          },
          request
        );
        break;

      case HttpStatus.FORBIDDEN:
        this.loggingService.auditSecurity(
          "AUTHORIZATION_FAILURE",
          {
            correlationId,
            userId: request.user?.id,
            endpoint: request.url,
            method: request.method,
            message: errorResponse.message,
          },
          request,
          request.user?.id
        );
        break;

      case HttpStatus.NOT_FOUND:
        this.loggingService.debug(
          `Resource Not Found [${correlationId}]: ${request.url}`,
          "GlobalExceptionFilter"
        );
        break;

      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.loggingService.error(
          `Internal Server Error [${correlationId}]: ${errorResponse.message}`,
          exception instanceof Error ? exception.stack : undefined,
          "GlobalExceptionFilter"
        );
        break;

      case HttpStatus.TOO_MANY_REQUESTS:
        this.loggingService.auditSecurity(
          "RATE_LIMITING_TRIGGERED",
          {
            correlationId,
            endpoint: request.url,
            ipAddress: request.ip,
            userAgent: request.get("User-Agent"),
          },
          request
        );
        break;
    }
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
