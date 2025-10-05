import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap, catchError, throwError } from "rxjs";
import { LoggingService } from "./logging.service";
import { AUDIT_METADATA_KEY, AuditConfig } from "./audit.decorator";
import { AuditCategory } from "./logger.config";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditConfig = this.reflector.get<AuditConfig>(
      AUDIT_METADATA_KEY,
      context.getHandler()
    );

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = this.extractResourceId(request);

    return next.handle().pipe(
      tap((result) => {
        // Log success si está configurado
        if (auditConfig.logSuccess) {
          this.logAuditSuccess(auditConfig, user, resourceId, result, request);
        }
      }),
      catchError((error) => {
        // Log failure si está configurado
        if (auditConfig.logFailure) {
          this.logAuditFailure(auditConfig, user, resourceId, error, request);
        }
        return throwError(() => error);
      })
    );
  }

  private extractResourceId(request: any): number | undefined {
    // Intentar extraer ID del parámetro 'id'
    if (request.params?.id) {
      return parseInt(request.params.id, 10);
    }
    return undefined;
  }

  private logAuditSuccess(
    config: AuditConfig,
    user: any,
    resourceId: number | undefined,
    result: any,
    request: any
  ) {
    const successAction = `${config.action}_SUCCESS`;

    switch (config.category) {
      case AuditCategory.BOOK_MANAGEMENT:
        this.loggingService.auditBookManagement(
          successAction,
          user?.id,
          user?.email,
          user?.role,
          resourceId || result?.id,
          true,
          this.extractBookMetadata(result, request),
          request
        );
        break;

      case AuditCategory.USER_MANAGEMENT:
        this.loggingService.auditUserManagement(
          successAction,
          user?.id,
          user?.email,
          resourceId || result?.id,
          true,
          this.extractUserMetadata(result, request, config.sensitiveData),
          request
        );
        break;

      case AuditCategory.GENRE_MANAGEMENT:
        this.loggingService.auditGenreManagement(
          successAction,
          user?.id,
          user?.email,
          user?.role,
          resourceId || result?.id,
          true,
          this.extractGenreMetadata(result, request),
          request
        );
        break;

      default:
        // Para otras categorías, log básico
        console.warn(
          `AuditInterceptor: No handler for category ${config.category}`
        );
    }
  }

  private logAuditFailure(
    config: AuditConfig,
    user: any,
    resourceId: number | undefined,
    error: any,
    request: any
  ) {
    const failureAction = `${config.action}_FAILURE`;

    switch (config.category) {
      case AuditCategory.BOOK_MANAGEMENT:
        this.loggingService.auditBookManagement(
          failureAction,
          user?.id,
          user?.email,
          user?.role,
          resourceId,
          false,
          {
            error: error.message,
            requestData: this.sanitizeRequestData(request.body),
          },
          request
        );
        break;

      case AuditCategory.USER_MANAGEMENT:
        this.loggingService.auditUserManagement(
          failureAction,
          user?.id,
          user?.email,
          resourceId,
          false,
          {
            error: error.message,
            requestData: this.sanitizeRequestData(
              request.body,
              config.sensitiveData
            ),
          },
          request
        );
        break;

      case AuditCategory.GENRE_MANAGEMENT:
        this.loggingService.auditGenreManagement(
          failureAction,
          user?.id,
          user?.email,
          user?.role,
          resourceId,
          false,
          {
            error: error.message,
            requestData: request.body,
          },
          request
        );
        break;

      default:
        // Para otras categorías, log básico
        console.warn(
          `AuditInterceptor: No failure handler for category ${config.category}`
        );
    }
  }

  private extractBookMetadata(result: any, request: any): any {
    if (!result) return {};

    return {
      bookTitle: result.titulo,
      bookAuthor: result.autor,
      bookGenre: result.generoId,
      ...(request.method === "PUT" && { changes: request.body }),
      ...(request.method === "DELETE" && { deletionType: "soft_delete" }),
    };
  }

  private extractUserMetadata(
    result: any,
    request: any,
    sensitiveData: boolean
  ): any {
    if (!result) return {};

    const metadata: any = {
      userEmail: result.email,
      userRole: result.role,
      ...(request.method === "PUT" && { changes: request.body }),
    };

    // Solo incluir datos sensibles si está permitido
    if (!sensitiveData) {
      delete metadata.password;
      delete metadata.changes?.password;
    }

    return metadata;
  }

  private extractGenreMetadata(result: any, request: any): any {
    if (!result) return {};

    return {
      genreName: result.nombre,
      genreDescription: result.descripcion,
      ...(request.method === "PUT" && { changes: request.body }),
    };
  }

  private sanitizeRequestData(data: any, includeSensitive = false): any {
    if (!data) return {};

    const sanitized = { ...data };

    if (!includeSensitive) {
      delete sanitized.password;
      delete sanitized.confirmPassword;
    }

    return sanitized;
  }
}
