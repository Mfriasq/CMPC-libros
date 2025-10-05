import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggingService } from "./logging.service";

// Extend Request interface to include logging metadata
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      correlationId?: string;
      userFingerprint?: string;
    }
  }
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Agregar timestamp de inicio
    req.startTime = Date.now();

    // Generar ID de correlación único para tracking
    req.correlationId = this.generateCorrelationId();

    // Crear fingerprint básico del usuario (sin datos sensibles)
    req.userFingerprint = this.createUserFingerprint(req);

    // Log de inicio de request
    this.loggingService.log(
      `Incoming ${req.method} ${req.originalUrl}`,
      `RequestMiddleware`
    );

    // Log detallado para endpoints críticos
    if (this.isCriticalEndpoint(req.originalUrl)) {
      this.loggingService.auditSecurity(
        "CRITICAL_ENDPOINT_ACCESS",
        {
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get("User-Agent"),
          correlationId: req.correlationId,
          userFingerprint: req.userFingerprint,
        },
        req
      );
    }

    // Interceptar la respuesta para log de finalización
    const loggingService = this.loggingService;
    const originalSend = res.send;

    res.send = function (body: any) {
      const duration = Date.now() - (req.startTime || 0);

      // Log de finalización
      if (loggingService) {
        loggingService.log(
          `Completed ${req.method} ${req.originalUrl} [${res.statusCode}] in ${duration}ms`,
          "RequestMiddleware"
        );
      }

      return originalSend.call(this, body);
    }.bind(res);

    next();
  }

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createUserFingerprint(req: Request): string {
    const components = [
      req.ip,
      req.get("User-Agent")?.substr(0, 50), // Limitar longitud
      req.get("Accept-Language")?.substr(0, 20),
    ];

    // Crear hash simple (no criptográfico, solo para tracking)
    return Buffer.from(components.join("|")).toString("base64").substr(0, 16);
  }

  private isCriticalEndpoint(url: string): boolean {
    const criticalPatterns = [
      "/auth/",
      "/users/",
      "/admin",
      "delete",
      "remove",
      "restore",
    ];

    return criticalPatterns.some((pattern) =>
      url.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}
