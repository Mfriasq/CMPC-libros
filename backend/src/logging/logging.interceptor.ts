import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { LoggingService } from "./logging.service";
import { Request } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers["user-agent"] || "";

    // Extraer información del usuario si está autenticado
    const user = request.user;
    const userId = user?.id;
    const userEmail = user?.email;
    const userRole = user?.role;

    // Determinar el tipo de operación
    const operation = this.getOperationType(method, url);
    const controllerClass = context.getClass().name;
    const handlerMethod = context.getHandler().name;

    // Log inicial de la request
    this.loggingService.log(
      `${method} ${url} - Started`,
      `${controllerClass}.${handlerMethod}`
    );

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log de éxito
        this.loggingService.log(
          `${method} ${url} - Completed [${statusCode}] in ${duration}ms`,
          `${controllerClass}.${handlerMethod}`
        );

        // Audit logging específico por tipo de operación
        this.logAuditBasedOnOperation(
          operation,
          url,
          method,
          userId,
          userEmail,
          userRole,
          request,
          { statusCode, duration, success: true }
        );

        // Log de rendimiento si es lento
        if (duration > 3000) {
          this.loggingService.logPerformance(
            `${controllerClass}.${handlerMethod}`,
            duration,
            userId,
            { method, url, statusCode }
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log del error
        this.loggingService.error(
          `${method} ${url} - Failed in ${duration}ms: ${error.message}`,
          error.stack,
          `${controllerClass}.${handlerMethod}`
        );

        // Audit logging del error
        this.logAuditBasedOnOperation(
          operation,
          url,
          method,
          userId,
          userEmail,
          userRole,
          request,
          { duration, success: false, error: error.message }
        );

        // Log de seguridad para ciertos errores
        if (this.isSecurityRelevantError(error, url)) {
          this.loggingService.auditSecurity(
            "SECURITY_ERROR",
            {
              error: error.message,
              endpoint: url,
              method,
              statusCode: error.status || 500,
            },
            request,
            userId
          );
        }

        throw error;
      })
    );
  }

  private getOperationType(method: string, url: string): string {
    const upperMethod = method.toUpperCase();

    // Detectar operaciones específicas basadas en la URL
    if (url.includes("/login")) return "LOGIN";
    if (url.includes("/register")) return "REGISTER";
    if (url.includes("/search")) return "SEARCH";
    if (url.includes("/export")) return "EXPORT";
    if (url.includes("/restore")) return "RESTORE";
    if (url.includes("/imagen")) return "UPLOAD_IMAGE";
    if (url.includes("/reports")) return "GENERATE_REPORT";
    if (url.includes("/statistics")) return "VIEW_STATISTICS";
    if (url.includes("/suspicious-activity")) return "VIEW_SUSPICIOUS";
    if (url.includes("/user-activity")) return "VIEW_USER_ACTIVITY";
    if (url.includes("/security")) return "VIEW_SECURITY";

    // Operaciones CRUD estándar
    switch (upperMethod) {
      case "GET":
        return "READ";
      case "POST":
        return "CREATE";
      case "PUT":
      case "PATCH":
        return "UPDATE";
      case "DELETE":
        return "DELETE";
      default:
        return "OPERATION";
    }
  }

  private logAuditBasedOnOperation(
    operation: string,
    url: string,
    method: string,
    userId?: number,
    userEmail?: string,
    userRole?: string,
    request?: Request,
    result?: any
  ) {
    const resourceType = this.extractResourceType(url);
    const resourceId = this.extractResourceId(url);

    // Determinar la categoría y acción apropiadas
    if (
      resourceType === "auth" ||
      operation === "LOGIN" ||
      operation === "REGISTER"
    ) {
      // Autenticación
      const action =
        operation === "LOGIN"
          ? result?.success
            ? "LOGIN_SUCCESS"
            : "LOGIN_FAILURE"
          : operation === "REGISTER"
            ? "REGISTER_ATTEMPT"
            : "AUTH_OPERATION";

      this.loggingService.auditAuth(
        action,
        userId,
        userEmail,
        result?.success ?? true,
        { method, url, ...result },
        request
      );
    } else if (resourceType === "users") {
      // Gestión de usuarios
      if (operation === "READ" || operation === "SEARCH") {
        this.loggingService.auditDataAccess(
          operation === "SEARCH"
            ? `SEARCH_${resourceType.toUpperCase()}`
            : `READ_${resourceType.toUpperCase()}`,
          userId,
          userEmail,
          resourceType,
          request?.query || {},
          request
        );
      } else {
        this.loggingService.auditUserManagement(
          `${operation}_USER`,
          userId,
          userEmail,
          resourceId,
          result?.success ?? true,
          { method, url, ...result },
          request
        );
      }
    } else if (resourceType === "libros") {
      // Gestión de libros
      if (
        operation === "READ" ||
        operation === "SEARCH" ||
        operation === "EXPORT"
      ) {
        const action =
          operation === "SEARCH"
            ? `SEARCH_${resourceType.toUpperCase()}`
            : operation === "EXPORT"
              ? `EXPORT_${resourceType.toUpperCase()}`
              : `READ_${resourceType.toUpperCase()}`;

        this.loggingService.auditDataAccess(
          action,
          userId,
          userEmail,
          resourceType,
          request?.query || {},
          request
        );
      } else {
        this.loggingService.auditBookManagement(
          `${operation}_BOOK`,
          userId,
          userEmail,
          userRole,
          resourceId,
          result?.success ?? true,
          { method, url, ...result },
          request
        );
      }
    } else if (resourceType === "generos" || resourceType === "estados") {
      // Gestión de géneros y estados
      if (operation === "READ" || operation === "SEARCH") {
        this.loggingService.auditDataAccess(
          operation === "SEARCH"
            ? `SEARCH_${resourceType.toUpperCase()}`
            : `READ_${resourceType.toUpperCase()}`,
          userId,
          userEmail,
          resourceType,
          request?.query || {},
          request
        );
      } else {
        this.loggingService.auditGenreManagement(
          `${operation}_${resourceType.toUpperCase().slice(0, -1)}`, // Remove 's' from plural
          userId,
          userEmail,
          userRole,
          resourceId,
          result?.success ?? true,
          { method, url, ...result },
          request
        );
      }
    } else if (resourceType === "audit") {
      // Reportes de auditoría
      const auditAction =
        operation === "GENERATE_REPORT"
          ? "GENERATE_AUDIT_REPORT"
          : operation === "VIEW_STATISTICS"
            ? "VIEW_AUDIT_STATISTICS"
            : operation === "VIEW_SUSPICIOUS"
              ? "VIEW_SUSPICIOUS_ACTIVITY"
              : operation === "VIEW_USER_ACTIVITY"
                ? "VIEW_USER_ACTIVITY"
                : operation === "VIEW_SECURITY"
                  ? "VIEW_SECURITY_LOGS"
                  : `ACCESS_AUDIT_${operation}`;

      this.loggingService.auditSecurity(
        auditAction,
        { method, url, ...result },
        request,
        userId
      );
    } else {
      // Otros endpoints - usar categoría SYSTEM
      this.loggingService.auditSystem(
        `${operation}_${resourceType.toUpperCase()}`,
        userId,
        userEmail,
        result?.success ?? true,
        { method, url, resourceType, ...result },
        request
      );
    }
  }

  private extractResourceType(url: string): string {
    // Remover query parameters
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/").filter((s) => s);

    // Buscar el recurso principal (primer segmento no numérico)
    for (const segment of segments) {
      if (segment && !segment.match(/^\d+$/)) {
        return segment;
      }
    }

    return "unknown";
  }

  private extractResourceId(url: string): number | undefined {
    // Remover query parameters
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/").filter((s) => s);

    // Buscar el primer segmento que sea un número (típicamente el ID del recurso)
    for (const segment of segments) {
      const id = parseInt(segment, 10);
      if (!isNaN(id) && id > 0) {
        return id;
      }
    }
    return undefined;
  }

  private isSecurityRelevantError(error: any, url: string): boolean {
    // Errores que son relevantes para seguridad
    const securityStatusCodes = [401, 403, 404, 429];
    const securityEndpoints = ["/auth/", "/login", "/register"];

    return (
      securityStatusCodes.includes(error.status) ||
      securityEndpoints.some((endpoint) => url.includes(endpoint)) ||
      error.message?.toLowerCase().includes("unauthorized") ||
      error.message?.toLowerCase().includes("forbidden") ||
      error.message?.toLowerCase().includes("token")
    );
  }
}
