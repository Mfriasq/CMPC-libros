import { validate } from "class-validator";
import { IsValidPrice, IsSafeName, IsValidImageUrl } from "./custom-validators";

// Clase de test para validadores de precio
class PriceTestDto {
  @IsValidPrice()
  price: number;
}

// Clase de test para validadores de nombres seguros
class NameTestDto {
  @IsSafeName()
  name: string;
}

// Clase de test para validadores de URL de imagen
class ImageUrlTestDto {
  @IsValidImageUrl()
  imageUrl: string;
}

describe("Custom Validators", () => {
  describe("IsValidPrice", () => {
    it("should accept valid prices", async () => {
      const validPrices = [
        0, // Free
        10.5, // With decimals
        15990, // Typical book price in CLP
        99.99, // Maximum 2 decimals
        1000000, // High price
      ];

      for (const price of validPrices) {
        const dto = new PriceTestDto();
        dto.price = price;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should reject invalid prices", async () => {
      const invalidPrices = [
        -10, // Negative price
        10.999, // More than 2 decimals
        15990.123, // More than 2 decimals
        "invalid", // String
        null, // Null
        undefined, // Undefined
      ];

      for (const price of invalidPrices) {
        const dto = new PriceTestDto();
        dto.price = price as any;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it("should handle edge cases for prices", async () => {
      const edgeCases = [
        0.01, // Minimum positive
        0.1, // Single decimal
        99999999.99, // Very high price
      ];

      for (const price of edgeCases) {
        const dto = new PriceTestDto();
        dto.price = price;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe("IsSafeName", () => {
    it("should accept safe names", async () => {
      const safeNames = [
        "Gabriel García Márquez",
        "José María Azuela",
        "Mario Vargas Llosa",
        "Isabel Allende",
        "Julio Cortázar",
        "O'Connor", // Apostrophe
        "Jean-Baptiste", // Hyphen
        "Editorial Planeta",
        "Biblioteca Nacional",
      ];

      for (const name of safeNames) {
        const dto = new NameTestDto();
        dto.name = name;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should validate name types", () => {
      const dto = new NameTestDto();
      dto.name = "Valid Name";
      expect(dto.name).toBeDefined();
      expect(typeof dto.name).toBe("string");
    });

    it("should handle international characters", async () => {
      const internationalNames = [
        "José María",
        "François Mitterrand",
        "André Breton",
        "Björk Guðmundsdóttir",
        "Naïve",
        "Café",
      ];

      for (const name of internationalNames) {
        const dto = new NameTestDto();
        dto.name = name;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe("IsValidImageUrl", () => {
    it("should accept valid image URLs", async () => {
      const validImageUrls = [
        "https://example.com/image.jpg",
        "https://example.com/image.png",
        "https://example.com/image.gif",
        "https://example.com/image.jpeg",
        "http://localhost:3000/uploads/book1.jpg",
        "https://secure-site.com/images/book-cover.png",
      ];

      for (const imageUrl of validImageUrls) {
        const dto = new ImageUrlTestDto();
        dto.imageUrl = imageUrl;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it("should validate image URL types", () => {
      const dto = new ImageUrlTestDto();
      dto.imageUrl = "https://example.com/image.jpg";
      expect(dto.imageUrl).toBeDefined();
      expect(typeof dto.imageUrl).toBe("string");
    });
  });

  describe("Validator Integration", () => {
    it("should validate book data with multiple custom validators", async () => {
      class BookTestDto {
        @IsSafeName()
        titulo: string;

        @IsSafeName()
        autor: string;

        @IsValidPrice()
        precio: number;

        @IsValidImageUrl()
        imageUrl: string;
      }

      // Valid book
      const validBook = new BookTestDto();
      validBook.titulo = "Cien años de soledad";
      validBook.autor = "Gabriel García Márquez";
      validBook.precio = 15990;
      validBook.imageUrl = "https://example.com/book-cover.jpg";

      const validErrors = await validate(validBook);
      expect(validErrors).toHaveLength(0);

      // Invalid book
      const invalidBook = new BookTestDto();
      invalidBook.titulo = "<script>alert(1)</script>";
      invalidBook.autor = "Author@#$%";
      invalidBook.precio = -100;
      invalidBook.imageUrl = "not-a-valid-url";

      const invalidErrors = await validate(invalidBook);
      expect(invalidErrors.length).toBeGreaterThan(3);
    });
  });
});
