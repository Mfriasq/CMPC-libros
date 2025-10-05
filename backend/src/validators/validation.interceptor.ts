import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from "@nestjs/common";
import { Observable, catchError, throwError } from "rxjs";
import { ValidationError } from "class-validator";

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Si es un error de validación de class-validator
        if (error instanceof BadRequestException) {
          const response = error.getResponse() as any;

          // Formatear errores de validación para mejor UX
          if (response?.message && Array.isArray(response.message)) {
            const formattedErrors = this.formatValidationErrors(
              response.message
            );

            return throwError(
              () =>
                new BadRequestException({
                  statusCode: 400,
                  error: "Validation Error",
                  message: "Los datos enviados no son válidos",
                  details: formattedErrors,
                  timestamp: new Date().toISOString(),
                })
            );
          }
        }

        return throwError(() => error);
      })
    );
  }

  private formatValidationErrors(messages: string[]): any {
    const errors: { [key: string]: string[] } = {};

    messages.forEach((message) => {
      // Intentar extraer el campo del mensaje de error
      // Los mensajes suelen tener formato "property should not be empty", etc.
      const fieldMatch = message.match(/^(\w+)\s/);
      const field = fieldMatch ? fieldMatch[1] : "general";

      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    });

    return errors;
  }
}
