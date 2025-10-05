import { Module, Global } from "@nestjs/common";
import { LoggingService } from "./logging.service";
import { RequestLoggingMiddleware } from "./request-logging.middleware";
import { AuditReportService } from "./audit-report.service";
import { AuditController } from "./audit.controller";
import { ResponseTransformInterceptor } from "./response-transform.interceptor";
import { GlobalExceptionFilter } from "./global-exception.filter";
import { AuditInterceptor } from "./audit.interceptor";

@Global()
@Module({
  controllers: [AuditController],
  providers: [
    LoggingService,
    RequestLoggingMiddleware,
    AuditReportService,
    ResponseTransformInterceptor,
    GlobalExceptionFilter,
    AuditInterceptor,
  ],
  exports: [
    LoggingService,
    RequestLoggingMiddleware,
    AuditReportService,
    ResponseTransformInterceptor,
    GlobalExceptionFilter,
    AuditInterceptor,
  ],
})
export class LoggingModule {}
