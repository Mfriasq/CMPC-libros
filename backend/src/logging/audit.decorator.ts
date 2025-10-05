import { SetMetadata } from "@nestjs/common";
import { AuditCategory } from "./logger.config";

// Metadata key para auditoría
export const AUDIT_METADATA_KEY = "audit";

// Interface para configuración de auditoría
export interface AuditConfig {
  category: AuditCategory;
  action: string;
  resourceType?: string;
  logSuccess?: boolean;
  logFailure?: boolean;
  sensitiveData?: boolean;
}

// Decorador para marcar métodos que requieren auditoría específica
export const Audit = (config: AuditConfig) =>
  SetMetadata(AUDIT_METADATA_KEY, config);

// Decoradores de conveniencia para categorías específicas
export const AuditAuth = (action: string) =>
  Audit({
    category: AuditCategory.AUTH,
    action,
    logSuccess: true,
    logFailure: true,
  });

export const AuditUserManagement = (action: string, sensitiveData = false) =>
  Audit({
    category: AuditCategory.USER_MANAGEMENT,
    action,
    resourceType: "User",
    logSuccess: true,
    logFailure: true,
    sensitiveData,
  });

export const AuditBookManagement = (action: string) =>
  Audit({
    category: AuditCategory.BOOK_MANAGEMENT,
    action,
    resourceType: "Book",
    logSuccess: true,
    logFailure: true,
  });

export const AuditGenreManagement = (action: string) =>
  Audit({
    category: AuditCategory.GENRE_MANAGEMENT,
    action,
    resourceType: "Genre",
    logSuccess: true,
    logFailure: true,
  });

export const AuditSecurity = (action: string) =>
  Audit({
    category: AuditCategory.SECURITY,
    action,
    logSuccess: true,
    logFailure: true,
    sensitiveData: true,
  });
