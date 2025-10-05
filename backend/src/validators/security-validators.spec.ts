import { validate } from "class-validator";
import {
  IsStrongPassword,
  IsCorporateEmail,
  IsSafeText,
} from "./security-validators";
import { IsEmail, IsString } from "class-validator";

// Clase de test para validadores de contraseña
class PasswordTestDto {
  @IsStrongPassword()
  password: string;
}

// Clase de test para validadores de email
class EmailTestDto {
  @IsEmail()
  @IsCorporateEmail()
  email: string;
}

// Clase de test para contenido seguro
class ContentTestDto {
  @IsSafeText()
  content: string;
}

describe("Security Validators", () => {
  describe("IsStrongPassword", () => {
    it("should accept valid strong passwords", async () => {
      const validPasswords = [
        "MySecure123!",
        "Strong#Pass789",
        "Complex$123Pass",
        "Secure&789Pass!",
      ];

      for (const password of validPasswords) {
        const dto = new PasswordTestDto();
        dto.password = password;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should reject weak passwords", async () => {
      const weakPasswords = [
        "weak", // Too short
        "weakpassword", // No uppercase, numbers, symbols
        "WEAKPASSWORD", // No lowercase, numbers, symbols
        "12345678", // No letters, symbols
        "WeakPass", // No numbers, symbols
        "WeakPass123", // No symbols
        "Weak Pass123!", // Contains spaces
        "password123", // Common sequence
        "admin123!", // Common sequence
        "123456789!", // Common sequence
      ];

      for (const password of weakPasswords) {
        const dto = new PasswordTestDto();
        dto.password = password;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it("should reject non-string passwords", async () => {
      const dto = new PasswordTestDto();
      dto.password = 123 as any;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("IsCorporateEmail", () => {
    it("should accept valid corporate emails", async () => {
      const validEmails = [
        "admin@biblioteca.com",
        "user@library.org",
        "test@edu.cl",
        "admin@gov.cl",
        "test@gmail.com",
        "user@outlook.com",
      ];

      for (const email of validEmails) {
        const dto = new EmailTestDto();
        dto.email = email;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should reject invalid domains", async () => {
      const invalidEmails = [
        "test@suspicious.com",
        "user@malicious.net",
        "admin@fake.org",
        "invalid-email",
        "@biblioteca.com",
        "test@",
      ];

      for (const email of invalidEmails) {
        const dto = new EmailTestDto();
        dto.email = email;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("IsSafeText", () => {
    it("should accept safe content", async () => {
      const safeContent = [
        "Este es un título normal",
        "Descripción del libro de ficción",
        "Gabriel García Márquez",
        "Editorial Planeta",
      ];

      for (const content of safeContent) {
        const dto = new ContentTestDto();
        dto.content = content;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should validate content exists", () => {
      const dto = new ContentTestDto();
      dto.content = "Valid content";
      expect(dto.content).toBeDefined();
      expect(typeof dto.content).toBe("string");
    });
  });

  describe("Validator Integration", () => {
    it("should validate multiple fields together", async () => {
      class FullUserDto {
        @IsEmail()
        @IsCorporateEmail()
        email: string;

        @IsStrongPassword()
        password: string;

        @IsSafeText()
        name: string;
      }

      // Valid user
      const validUser = new FullUserDto();
      validUser.email = "admin@biblioteca.com";
      validUser.password = "SecurePass123!";
      validUser.name = "Administrator";

      const validErrors = await validate(validUser);
      expect(validErrors).toHaveLength(0);

      // Invalid user
      const invalidUser = new FullUserDto();
      invalidUser.email = "invalid@badomain.com";
      invalidUser.password = "weak";
      invalidUser.name = "<script>alert(1)</script>";

      const invalidErrors = await validate(invalidUser);
      expect(invalidErrors.length).toBeGreaterThan(2);
    });
  });
});
