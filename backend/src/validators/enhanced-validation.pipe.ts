import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // No validar tipos primitivos
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transformar el objeto plano a una instancia de clase
    const object = plainToClass(metatype, value);

    // Validar el objeto
    const errors = await validate(object, {
      whitelist: true, // Solo propiedades decoradas
      forbidNonWhitelisted: true, // Rechazar propiedades no permitidas
      transform: true, // Transformar tipos automáticamente
      skipMissingProperties: false, // Validar propiedades faltantes
      validationError: {
        target: false, // No incluir el objeto completo en el error
        value: false, // No incluir valores en el error por seguridad
      },
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        error: "Validation Failed",
        message: "Los datos enviados no cumplen con las reglas de validación",
        details: formattedErrors,
        timestamp: new Date().toISOString(),
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): any {
    const formattedErrors: { [key: string]: string[] } = {};

    const processError = (error: any, prefix = "") => {
      const property = prefix ? `${prefix}.${error.property}` : error.property;

      if (error.constraints) {
        if (!formattedErrors[property]) {
          formattedErrors[property] = [];
        }

        Object.values(error.constraints).forEach((message: string) => {
          formattedErrors[property].push(message);
        });
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((childError: any) => {
          processError(childError, property);
        });
      }
    };

    errors.forEach((error) => {
      processError(error);
    });

    return formattedErrors;
  }
}
