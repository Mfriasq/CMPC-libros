import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

// Interface para respuestas exitosas estandarizadas
interface StandardResponse<T = any> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Si la data ya es una respuesta estandarizada, devolverla tal cual
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          "statusCode" in data
        ) {
          return data;
        }

        // Determinar si hay metadatos de paginación
        const meta = this.extractPaginationMeta(data, request);

        // Crear respuesta estandarizada
        const standardResponse: StandardResponse<T> = {
          success: true,
          statusCode: response.statusCode || 200,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data: this.extractData(data),
          message: this.extractMessage(data, context),
        };

        // Agregar metadatos si existen
        if (meta) {
          standardResponse.meta = meta;
        }

        return standardResponse;
      })
    );
  }

  private extractData(data: any): any {
    // Si la data tiene estructura de paginación, extraer solo los items
    if (data && typeof data === "object") {
      // Estructura común: { items: [], total: number, ... }
      if ("items" in data && Array.isArray(data.items)) {
        return data.items;
      }

      // Estructura común: { data: [], total: number, ... }
      if ("data" in data && Array.isArray(data.data)) {
        return data.data;
      }

      // Estructura común: { results: [], total: number, ... }
      if ("results" in data && Array.isArray(data.results)) {
        return data.results;
      }
    }

    return data;
  }

  private extractPaginationMeta(data: any, request: any): any {
    if (!data || typeof data !== "object") return null;

    const meta: any = {};
    let hasMeta = false;

    // Extraer información de paginación de la data
    if ("total" in data && typeof data.total === "number") {
      meta.total = data.total;
      hasMeta = true;
    }

    if ("count" in data && typeof data.count === "number") {
      meta.total = data.count;
      hasMeta = true;
    }

    // Extraer información de paginación de los query parameters
    const query = request.query || {};

    if (query.page) {
      const page = parseInt(query.page, 10);
      if (!isNaN(page)) {
        meta.page = page;
        hasMeta = true;
      }
    }

    if (query.limit) {
      const limit = parseInt(query.limit, 10);
      if (!isNaN(limit)) {
        meta.limit = limit;
        hasMeta = true;
      }
    }

    // Calcular hasNextPage y hasPrevPage si tenemos total, page y limit
    if (meta.total && meta.page && meta.limit) {
      const totalPages = Math.ceil(meta.total / meta.limit);
      meta.hasNextPage = meta.page < totalPages;
      meta.hasPrevPage = meta.page > 1;
    }

    return hasMeta ? meta : null;
  }

  private extractMessage(data: any, context: ExecutionContext): string {
    // Mensaje personalizado si existe en la data
    if (data && typeof data === "object" && "message" in data) {
      return data.message;
    }

    // Generar mensaje basado en el método HTTP y controlador
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const controllerName = context.getClass().name.replace("Controller", "");
    const handlerName = context.getHandler().name;

    switch (method) {
      case "POST":
        return `${controllerName} created successfully`;
      case "PUT":
      case "PATCH":
        return `${controllerName} updated successfully`;
      case "DELETE":
        return `${controllerName} deleted successfully`;
      case "GET":
      default:
        if (handlerName.includes("search") || handlerName.includes("find")) {
          return `${controllerName} retrieved successfully`;
        }
        return "Operation completed successfully";
    }
  }
}

/**
 * Decorator para usar respuestas estandarizadas en controladores específicos
 */
export function UseStandardResponse() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    // Este decorator se puede usar para marcar métodos que requieren respuesta estandarizada
    // Por ahora es principalmente documentativo, pero se puede expandir
    Reflect.defineMetadata("use-standard-response", true, target, propertyName);
  };
}

/**
 * Helper para crear respuestas manuales estandarizadas
 */
export class ResponseHelper {
  static success<T>(
    data: T,
    message?: string,
    meta?: any,
    statusCode: number = 200
  ): StandardResponse<T> {
    return {
      success: true,
      statusCode,
      timestamp: new Date().toISOString(),
      path: "", // Se llenará por el interceptor si es necesario
      method: "", // Se llenará por el interceptor si es necesario
      data,
      message,
      meta,
    };
  }

  static created<T>(data: T, message?: string): StandardResponse<T> {
    return this.success(data, message, undefined, 201);
  }

  static updated<T>(data: T, message?: string): StandardResponse<T> {
    return this.success(data, message || "Resource updated successfully");
  }

  static deleted(message?: string): StandardResponse<null> {
    return this.success(null, message || "Resource deleted successfully");
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): StandardResponse<T[]> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: "",
      method: "",
      data: items,
      message: message || "Data retrieved successfully",
      meta: {
        total,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
