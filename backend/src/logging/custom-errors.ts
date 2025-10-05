import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Errores personalizados para diferentes escenarios de negocio
 */

export class BusinessLogicError extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        error: "BusinessLogicError",
        statusCode: HttpStatus.BAD_REQUEST,
        details,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ResourceNotFoundError extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with ID "${id}" not found`
      : `${resource} not found`;

    super(
      {
        message,
        error: "ResourceNotFoundError",
        statusCode: HttpStatus.NOT_FOUND,
        resource,
        id,
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class DuplicateResourceError extends HttpException {
  constructor(resource: string, field: string, value: any) {
    super(
      {
        message: `${resource} with ${field} "${value}" already exists`,
        error: "DuplicateResourceError",
        statusCode: HttpStatus.CONFLICT,
        resource,
        field,
        value,
      },
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidOperationError extends HttpException {
  constructor(operation: string, reason: string) {
    super(
      {
        message: `Cannot perform operation "${operation}": ${reason}`,
        error: "InvalidOperationError",
        statusCode: HttpStatus.BAD_REQUEST,
        operation,
        reason,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class AuthenticationError extends HttpException {
  constructor(message: string = "Authentication failed") {
    super(
      {
        message,
        error: "AuthenticationError",
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class AuthorizationError extends HttpException {
  constructor(resource: string, action: string) {
    super(
      {
        message: `Insufficient permissions to ${action} ${resource}`,
        error: "AuthorizationError",
        statusCode: HttpStatus.FORBIDDEN,
        resource,
        action,
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class ValidationError extends HttpException {
  constructor(field: string, value: any, rule: string) {
    super(
      {
        message: `Validation failed for field "${field}"`,
        error: "ValidationError",
        statusCode: HttpStatus.BAD_REQUEST,
        field,
        value,
        rule,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ExternalServiceError extends HttpException {
  constructor(service: string, message: string, details?: any) {
    super(
      {
        message: `External service error from ${service}: ${message}`,
        error: "ExternalServiceError",
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        service,
        details,
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}

export class RateLimitError extends HttpException {
  constructor(limit: number, windowMs: number) {
    super(
      {
        message: `Rate limit exceeded: ${limit} requests per ${windowMs}ms`,
        error: "RateLimitError",
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        limit,
        windowMs,
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

/**
 * Helper function para lanzar errores de manera consistente
 */
export class ErrorHelper {
  static throwBusinessError(message: string, details?: any): never {
    throw new BusinessLogicError(message, details);
  }

  static throwNotFound(resource: string, id?: string | number): never {
    throw new ResourceNotFoundError(resource, id);
  }

  static throwDuplicate(resource: string, field: string, value: any): never {
    throw new DuplicateResourceError(resource, field, value);
  }

  static throwInvalidOperation(operation: string, reason: string): never {
    throw new InvalidOperationError(operation, reason);
  }

  static throwUnauthorized(message?: string): never {
    throw new AuthenticationError(message);
  }

  static throwForbidden(resource: string, action: string): never {
    throw new AuthorizationError(resource, action);
  }

  static throwValidation(field: string, value: any, rule: string): never {
    throw new ValidationError(field, value, rule);
  }

  static throwExternalService(
    service: string,
    message: string,
    details?: any
  ): never {
    throw new ExternalServiceError(service, message, details);
  }

  static throwRateLimit(limit: number, windowMs: number): never {
    throw new RateLimitError(limit, windowMs);
  }
}
