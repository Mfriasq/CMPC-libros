import { Module, Global } from "@nestjs/common";
import { LoggingService } from "./logging.service";
import { RequestLoggingMiddleware } from "./request-logging.middleware";
import { AuditReportService } from "./audit-report.service";
import { AuditController } from "./audit.controller";

@Global()
@Module({
  controllers: [AuditController],
  providers: [LoggingService, RequestLoggingMiddleware, AuditReportService],
  exports: [LoggingService, RequestLoggingMiddleware, AuditReportService],
})
export class LoggingModule {}
