import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

// Validador para precios en formato CLP (pesos chilenos)
@ValidatorConstraint({ name: "isValidPrice", async: false })
export class IsValidPriceConstraint implements ValidatorConstraintInterface {
  validate(price: any, args: ValidationArguments) {
    if (typeof price !== "number") return false;

    // Los precios deben ser positivos y tener máximo 2 decimales
    if (price < 0) return false;

    // Verificar que no tenga más de 2 decimales
    const decimalPlaces = (price.toString().split(".")[1] || "").length;
    return decimalPlaces <= 2;
  }

  defaultMessage(args: ValidationArguments) {
    return "El precio debe ser un número positivo con máximo 2 decimales";
  }
}

export function IsValidPrice(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPriceConstraint,
    });
  };
}

// Validador para nombres que no contengan caracteres especiales peligrosos
@ValidatorConstraint({ name: "isSafeName", async: false })
export class IsSafeNameConstraint implements ValidatorConstraintInterface {
  validate(name: any, args: ValidationArguments) {
    if (typeof name !== "string") return false;

    // Permitir letras, números, espacios, guiones, apostrofes y algunos caracteres latinos
    const safeNameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'\.]+$/;

    // No debe empezar o terminar con espacios
    if (name.trim() !== name) return false;

    // No debe tener espacios múltiples consecutivos
    if (/\s{2,}/.test(name)) return false;

    return safeNameRegex.test(name);
  }

  defaultMessage(args: ValidationArguments) {
    return "El nombre solo puede contener letras, números, espacios, guiones y apostrofes";
  }
}

export function IsSafeName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeNameConstraint,
    });
  };
}

// Validador para URLs de imagen
@ValidatorConstraint({ name: "isValidImageUrl", async: false })
export class IsValidImageUrlConstraint implements ValidatorConstraintInterface {
  validate(url: any, args: ValidationArguments) {
    // Si es null, undefined o string vacío, es válido (campo opcional)
    if (!url || url === "" || url === null || url === undefined) {
      return true;
    }

    if (typeof url !== "string") return false;

    // Verificar que sea una URL válida
    try {
      const urlObj = new URL(url, "http://localhost");

      // Verificar extensiones de imagen permitidas
      const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
      return validExtensions.test(urlObj.pathname);
    } catch {
      // Si no es una URL absoluta, verificar como path relativo
      const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
      const validPath = /^\/[a-zA-Z0-9\/_\-\.]+$/;

      return validExtensions.test(url) && validPath.test(url);
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "URL de imagen debe ser válida y tener extensión permitida (jpg, jpeg, png, gif, webp, svg)";
  }
}

export function IsValidImageUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidImageUrlConstraint,
    });
  };
}
