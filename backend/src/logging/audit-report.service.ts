import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { LoggingService } from "./logging.service";
import { AuditCategory } from "./logger.config";

export interface AuditReportFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  category?: AuditCategory;
  action?: string;
  success?: boolean;
  ipAddress?: string;
}

export interface AuditReportEntry {
  timestamp: string;
  category: string;
  action: string;
  userId?: number;
  userEmail?: string;
  success: boolean;
  resourceType?: string;
  resourceId?: number;
  ipAddress?: string;
  details?: any;
}

@Injectable()
export class AuditReportService {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Generar reporte de auditoría basado en filtros
   */
  async generateAuditReport(
    filters: AuditReportFilter
  ): Promise<AuditReportEntry[]> {
    try {
      const auditEntries = await this.readAuditLogs(filters);

      // Log del reporte generado
      this.loggingService.auditDataAccess(
        "GENERATE_AUDIT_REPORT",
        undefined,
        "system",
        "AuditReport",
        filters
      );

      return auditEntries;
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditReportService.generateAuditReport"
      );
      throw error;
    }
  }

  /**
   * Generar reporte de actividad de usuario específico
   */
  async generateUserActivityReport(
    userId: number,
    days: number = 30
  ): Promise<AuditReportEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.generateAuditReport({
      userId,
      startDate,
      endDate: new Date(),
    });
  }

  /**
   * Generar reporte de eventos de seguridad
   */
  async generateSecurityReport(
    hours: number = 24
  ): Promise<AuditReportEntry[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.generateAuditReport({
      category: AuditCategory.SECURITY,
      startDate,
      endDate: new Date(),
    });
  }

  /**
   * Generar estadísticas de uso del sistema
   */
  async generateUsageStatistics(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await this.generateAuditReport({
        startDate,
        endDate: new Date(),
      });

      const statistics = {
        totalOperations: entries.length,
        successfulOperations: entries.filter((e) => e.success).length,
        failedOperations: entries.filter((e) => !e.success).length,
        uniqueUsers: new Set(entries.map((e) => e.userId).filter(Boolean)).size,
        operationsByCategory: this.groupByCategory(entries),
        operationsByUser: this.groupByUser(entries),
        operationsByHour: this.groupByHour(entries),
        mostActiveUsers: this.getMostActiveUsers(entries),
        failureRate:
          entries.length > 0
            ? (
                (entries.filter((e) => !e.success).length / entries.length) *
                100
              ).toFixed(2)
            : 0,
      };

      // Log de generación de estadísticas
      this.loggingService.auditDataAccess(
        "GENERATE_USAGE_STATISTICS",
        undefined,
        "system",
        "UsageStatistics",
        { days, totalEntries: entries.length }
      );

      return statistics;
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditReportService.generateUsageStatistics"
      );
      throw error;
    }
  }

  /**
   * Detectar patrones sospechosos de actividad
   */
  async detectSuspiciousActivity(): Promise<any[]> {
    try {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      const entries = await this.generateAuditReport({
        startDate: last24Hours,
        endDate: new Date(),
      });

      const suspiciousPatterns = [];

      // Patrón 1: Múltiples fallos de login desde la misma IP
      const loginFailures = entries.filter(
        (e) =>
          e.action.includes("LOGIN_FAILURE") ||
          e.action.includes("FAILED_LOGIN")
      );

      const failuresByIP = this.groupBy(loginFailures, "ipAddress");

      Object.entries(failuresByIP).forEach(
        ([ip, failures]: [string, any[]]) => {
          if (failures.length >= 5) {
            suspiciousPatterns.push({
              type: "MULTIPLE_LOGIN_FAILURES",
              severity: "HIGH",
              description: `${failures.length} failed login attempts from IP ${ip}`,
              ipAddress: ip,
              count: failures.length,
              timespan: "24 hours",
            });
          }
        }
      );

      // Patrón 2: Actividad fuera de horario normal (ejemplo: 2 AM - 6 AM)
      const offHoursActivity = entries.filter((e) => {
        const hour = new Date(e.timestamp).getHours();
        return hour >= 2 && hour <= 6;
      });

      if (offHoursActivity.length > 10) {
        suspiciousPatterns.push({
          type: "OFF_HOURS_ACTIVITY",
          severity: "MEDIUM",
          description: `${offHoursActivity.length} operations during off-hours (2 AM - 6 AM)`,
          count: offHoursActivity.length,
          timespan: "24 hours",
        });
      }

      // Patrón 3: Usuario con tasa de error alta
      const operationsByUser = this.groupByUser(entries);

      Object.entries(operationsByUser).forEach(
        ([userId, operations]: [string, any[]]) => {
          const failures = operations.filter((op) => !op.success);
          const failureRate = failures.length / operations.length;

          if (operations.length >= 10 && failureRate >= 0.5) {
            suspiciousPatterns.push({
              type: "HIGH_FAILURE_RATE",
              severity: "MEDIUM",
              description: `User ${userId} has ${(failureRate * 100).toFixed(1)}% failure rate`,
              userId: parseInt(userId),
              failureRate: (failureRate * 100).toFixed(1) + "%",
              totalOperations: operations.length,
            });
          }
        }
      );

      // Log de detección de patrones sospechosos
      this.loggingService.auditSecurity("SUSPICIOUS_ACTIVITY_DETECTION", {
        patternsFound: suspiciousPatterns.length,
        patterns: suspiciousPatterns.map((p) => p.type),
      });

      return suspiciousPatterns;
    } catch (error) {
      this.loggingService.logSystemError(
        error,
        "AuditReportService.detectSuspiciousActivity"
      );
      throw error;
    }
  }

  /**
   * Leer archivos de log de auditoría
   */
  private async readAuditLogs(
    filters: AuditReportFilter
  ): Promise<AuditReportEntry[]> {
    const logsDir = path.join(process.cwd(), "logs");
    const entries: AuditReportEntry[] = [];

    try {
      const files = fs
        .readdirSync(logsDir)
        .filter((file) => file.startsWith("audit-") && file.endsWith(".log"))
        .sort(); // Ordenar cronológicamente

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);

            // Aplicar filtros
            if (this.matchesFilters(logEntry, filters)) {
              entries.push(this.normalizeLogEntry(logEntry));
            }
          } catch (parseError) {
            // Ignorar líneas que no sean JSON válido
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Error reading audit logs:", error);
    }

    return entries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Verificar si una entrada de log coincide con los filtros
   */
  private matchesFilters(entry: any, filters: AuditReportFilter): boolean {
    if (filters.startDate && new Date(entry.timestamp) < filters.startDate)
      return false;
    if (filters.endDate && new Date(entry.timestamp) > filters.endDate)
      return false;
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.category && entry.category !== filters.category) return false;
    if (filters.action && !entry.action.includes(filters.action)) return false;
    if (filters.success !== undefined && entry.success !== filters.success)
      return false;
    if (filters.ipAddress && entry.ipAddress !== filters.ipAddress)
      return false;

    return true;
  }

  /**
   * Normalizar entrada de log a formato de reporte
   */
  private normalizeLogEntry(entry: any): AuditReportEntry {
    return {
      timestamp: entry.timestamp,
      category: entry.category || "UNKNOWN",
      action: entry.action || "UNKNOWN_ACTION",
      userId: entry.userId,
      userEmail: entry.userEmail,
      success: entry.success !== false, // Default to true if not specified
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      ipAddress: entry.ipAddress,
      details: entry.details,
    };
  }

  /**
   * Agrupar entradas por categoría
   */
  private groupByCategory(entries: AuditReportEntry[]): Record<string, number> {
    return entries.reduce(
      (acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Agrupar entradas por usuario
   */
  private groupByUser(
    entries: AuditReportEntry[]
  ): Record<string, AuditReportEntry[]> {
    return this.groupBy(
      entries.filter((e) => e.userId),
      "userId"
    );
  }

  /**
   * Agrupar entradas por hora del día
   */
  private groupByHour(entries: AuditReportEntry[]): Record<string, number> {
    return entries.reduce(
      (acc, entry) => {
        const hour = new Date(entry.timestamp)
          .getHours()
          .toString()
          .padStart(2, "0");
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Obtener usuarios más activos
   */
  private getMostActiveUsers(
    entries: AuditReportEntry[]
  ): Array<{ userId: number; operations: number; email?: string }> {
    const userOperations = this.groupByUser(entries);

    return Object.entries(userOperations)
      .map(([userId, operations]) => ({
        userId: parseInt(userId),
        operations: operations.length,
        email: operations[0]?.userEmail,
      }))
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 10); // Top 10
  }

  /**
   * Función helper para agrupar por campo
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  }
}
