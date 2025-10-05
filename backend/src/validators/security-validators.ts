import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

// Validador para contraseñas seguras
@ValidatorConstraint({ name: "isStrongPassword", async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: any, args: ValidationArguments) {
    if (typeof password !== "string") return false;

    const minLength = 8;
    const maxLength = 128;

    // Verificar longitud
    if (password.length < minLength || password.length > maxLength)
      return false;

    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) return false;

    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) return false;

    // Al menos un número
    if (!/\d/.test(password)) return false;

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    // No debe contener espacios
    if (/\s/.test(password)) return false;

    // No debe contener secuencias comunes
    const commonSequences = [
      "123456",
      "abcdef",
      "qwerty",
      "password",
      "admin",
      "user",
      "111111",
      "000000",
      "abc123",
      "123abc",
    ];

    const lowerPassword = password.toLowerCase();
    for (const sequence of commonSequences) {
      if (lowerPassword.includes(sequence)) return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos especiales. No debe contener secuencias comunes.";
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Validador para email corporativo (opcional)
@ValidatorConstraint({ name: "isCorporateEmail", async: false })
export class IsCorporateEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(email: any, args: ValidationArguments) {
    if (typeof email !== "string") return false;

    // Lista de dominios de email corporativos/institucionales permitidos
    const allowedDomains = [
      "biblioteca.com",
      "library.org",
      "edu.cl",
      "gov.cl",
      "gmail.com", // Permitido temporalmente para desarrollo
      "outlook.com",
      "hotmail.com",
    ];

    const emailParts = email.split("@");
    if (emailParts.length !== 2) return false;

    const domain = emailParts[1].toLowerCase();
    return allowedDomains.some(
      (allowedDomain) =>
        domain === allowedDomain || domain.endsWith("." + allowedDomain)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return "El email debe pertenecer a un dominio autorizado";
  }
}

export function IsCorporateEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCorporateEmailConstraint,
    });
  };
}

// Validador para confirmar contraseña
export function IsPasswordMatch(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isPasswordMatch",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return "Las contraseñas no coinciden";
        },
      },
    });
  };
}

// Validador para texto sin contenido malicioso (prevención XSS básica)
@ValidatorConstraint({ name: "isSafeText", async: false })
export class IsSafeTextConstraint implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    if (typeof text !== "string") return false;

    // Lista de patrones potencialmente peligrosos
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
      /document\./gi,
      /window\./gi,
      /eval\(/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "El texto contiene contenido potencialmente peligroso";
  }
}

export function IsSafeText(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeTextConstraint,
    });
  };
}

// Validador para rangos de fechas
export function IsDateInRange(
  minDate?: Date | (() => Date),
  maxDate?: Date | (() => Date),
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateInRange",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minDate, maxDate],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date) && typeof value !== "string")
            return false;

          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return false;

          const [minDateConstraint, maxDateConstraint] = args.constraints;

          if (minDateConstraint) {
            const minDate =
              typeof minDateConstraint === "function"
                ? minDateConstraint()
                : minDateConstraint;
            if (date < minDate) return false;
          }

          if (maxDateConstraint) {
            const maxDate =
              typeof maxDateConstraint === "function"
                ? maxDateConstraint()
                : maxDateConstraint;
            if (date > maxDate) return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return "La fecha debe estar dentro del rango permitido";
        },
      },
    });
  };
}
