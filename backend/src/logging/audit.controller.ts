import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.model";
import { LoggingService } from "./logging.service";
import { AuditReportService, AuditReportFilter } from "./audit-report.service";
import { AuditSecurity } from "./audit.decorator";

@ApiTags("Auditoría y Reportes")
@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Solo administradores pueden acceder a auditoría
@ApiBearerAuth()
export class AuditController {
  constructor(
    private readonly auditReportService: AuditReportService,
    private readonly loggingService: LoggingService
  ) {}

  @Get("reports")
  @AuditSecurity("ACCESS_AUDIT_REPORTS")
  @ApiOperation({ summary: "Generar reporte de auditoría con filtros" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Fecha de inicio (ISO string)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "Fecha de fin (ISO string)",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "ID del usuario a filtrar",
  })
  @ApiQuery({
    name: "category",
    required: false,
    description: "Categoría de auditoría",
  })
  @ApiQuery({
    name: "action",
    required: false,
    description: "Acción específica",
  })
  @ApiQuery({
    name: "success",
    required: false,
    description: "Filtrar por éxito/fallo",
  })
  @ApiResponse({
    status: 200,
    description: "Reporte de auditoría generado exitosamente.",
  })
  async getAuditReport(@Query() query: any, @Request() req: any) {
    try {
      const filters: AuditReportFilter = {
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        userId: query.userId ? parseInt(query.userId) : undefined,
        category: query.category,
        action: query.action,
        success:
          query.success !== undefined ? query.success === "true" : undefined,
      };

      const report = await this.auditReportService.generateAuditReport(filters);

      // Log del acceso al reporte
      this.loggingService.auditSecurity(
        "AUDIT_REPORT_ACCESS",
        {
          filters,
          resultCount: report.length,
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        filters,
        totalEntries: report.length,
        data: report,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getAuditReport",
        req.user.id,
        req
      );
      throw error;
    }
  }

  @Get("user-activity/:userId")
  @AuditSecurity("ACCESS_USER_ACTIVITY")
  @ApiOperation({
    summary: "Generar reporte de actividad de usuario específico",
  })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Días hacia atrás (default: 30)",
  })
  @ApiResponse({
    status: 200,
    description: "Reporte de actividad de usuario generado.",
  })
  async getUserActivityReport(
    @Query("userId", ParseIntPipe) userId: number,
    @Query("days", new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Request() req: any
  ) {
    try {
      const report = await this.auditReportService.generateUserActivityReport(
        userId,
        days
      );

      // Log del acceso al reporte de usuario
      this.loggingService.auditSecurity(
        "USER_ACTIVITY_REPORT_ACCESS",
        {
          targetUserId: userId,
          days,
          resultCount: report.length,
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        userId,
        days,
        totalEntries: report.length,
        data: report,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getUserActivityReport",
        req.user.id,
        req
      );
      throw error;
    }
  }

  @Get("security")
  @AuditSecurity("ACCESS_SECURITY_REPORTS")
  @ApiOperation({ summary: "Generar reporte de eventos de seguridad" })
  @ApiQuery({
    name: "hours",
    required: false,
    description: "Horas hacia atrás (default: 24)",
  })
  @ApiResponse({
    status: 200,
    description: "Reporte de eventos de seguridad generado.",
  })
  async getSecurityReport(
    @Query("hours", new DefaultValuePipe(24), ParseIntPipe) hours: number,
    @Request() req: any
  ) {
    try {
      const report =
        await this.auditReportService.generateSecurityReport(hours);

      // Log del acceso al reporte de seguridad
      this.loggingService.auditSecurity(
        "SECURITY_REPORT_ACCESS",
        {
          hours,
          resultCount: report.length,
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        hours,
        totalEntries: report.length,
        data: report,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getSecurityReport",
        req.user.id,
        req
      );
      throw error;
    }
  }

  @Get("statistics")
  @AuditSecurity("ACCESS_USAGE_STATISTICS")
  @ApiOperation({ summary: "Generar estadísticas de uso del sistema" })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Días hacia atrás (default: 7)",
  })
  @ApiResponse({
    status: 200,
    description: "Estadísticas de uso generadas.",
  })
  async getUsageStatistics(
    @Query("days", new DefaultValuePipe(7), ParseIntPipe) days: number,
    @Request() req: any
  ) {
    try {
      const statistics =
        await this.auditReportService.generateUsageStatistics(days);

      // Log del acceso a las estadísticas
      this.loggingService.auditSecurity(
        "USAGE_STATISTICS_ACCESS",
        {
          days,
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        period: `${days} days`,
        data: statistics,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getUsageStatistics",
        req.user.id,
        req
      );
      throw error;
    }
  }

  @Get("suspicious-activity")
  @AuditSecurity("ACCESS_SUSPICIOUS_ACTIVITY")
  @ApiOperation({ summary: "Detectar patrones de actividad sospechosa" })
  @ApiResponse({
    status: 200,
    description: "Análisis de actividad sospechosa completado.",
  })
  async getSuspiciousActivity(@Request() req: any) {
    try {
      const suspiciousPatterns =
        await this.auditReportService.detectSuspiciousActivity();

      // Log del acceso al análisis de actividad sospechosa
      this.loggingService.auditSecurity(
        "SUSPICIOUS_ACTIVITY_ANALYSIS_ACCESS",
        {
          patternsFound: suspiciousPatterns.length,
          patterns: suspiciousPatterns.map((p) => ({
            type: p.type,
            severity: p.severity,
          })),
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        analysisType: "Last 24 hours",
        totalPatterns: suspiciousPatterns.length,
        data: suspiciousPatterns,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getSuspiciousActivity",
        req.user.id,
        req
      );
      throw error;
    }
  }

  @Get("system-health")
  @AuditSecurity("ACCESS_SYSTEM_HEALTH")
  @ApiOperation({ summary: "Obtener métricas de salud del sistema de logging" })
  @ApiResponse({
    status: 200,
    description: "Métricas de salud del sistema obtenidas.",
  })
  async getSystemHealth(@Request() req: any) {
    try {
      // Obtener estadísticas básicas del sistema
      const last24h = await this.auditReportService.generateUsageStatistics(1);
      const last7d = await this.auditReportService.generateUsageStatistics(7);
      const suspiciousActivity =
        await this.auditReportService.detectSuspiciousActivity();

      const health = {
        timestamp: new Date().toISOString(),
        logging: {
          status: "healthy",
          logsDirectory: "/logs",
        },
        activity: {
          last24Hours: {
            totalOperations: last24h.totalOperations,
            successRate:
              (100 - parseFloat(last24h.failureRate)).toFixed(2) + "%",
            uniqueUsers: last24h.uniqueUsers,
            failureRate: last24h.failureRate + "%",
          },
          last7Days: {
            totalOperations: last7d.totalOperations,
            successRate:
              (100 - parseFloat(last7d.failureRate)).toFixed(2) + "%",
            uniqueUsers: last7d.uniqueUsers,
            failureRate: last7d.failureRate + "%",
          },
        },
        security: {
          suspiciousPatterns: suspiciousActivity.length,
          highSeverityAlerts: suspiciousActivity.filter(
            (p) => p.severity === "HIGH"
          ).length,
          mediumSeverityAlerts: suspiciousActivity.filter(
            (p) => p.severity === "MEDIUM"
          ).length,
        },
      };

      // Log del acceso a métricas de salud
      this.loggingService.auditSecurity(
        "SYSTEM_HEALTH_CHECK",
        {
          healthStatus: health,
          adminId: req.user.id,
          adminEmail: req.user.email,
        },
        req,
        req.user.id
      );

      return {
        success: true,
        data: health,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: req.user.id,
          email: req.user.email,
        },
      };
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditController.getSystemHealth",
        req.user.id,
        req
      );
      throw error;
    }
  }
}
