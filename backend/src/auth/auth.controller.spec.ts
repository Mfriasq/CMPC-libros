import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "ADMIN",
    password: "hashedPassword",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should return access token when credentials are valid", async () => {
      const expectedResult = {
        access_token: "jwt-token-here",
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Credenciales inválidas")
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw BadRequestException when email is missing", async () => {
      const invalidDto = { password: "password123" } as any;

      await expect(controller.login(invalidDto)).rejects.toThrow();
    });

    it("should throw BadRequestException when password is missing", async () => {
      const invalidDto = { email: "test@example.com" } as any;

      await expect(controller.login(invalidDto)).rejects.toThrow();
    });
  });

  describe("getProfile", () => {
    it("should return user profile from request", async () => {
      const userWithToJSON = {
        ...mockUser,
        toJSON: jest.fn().mockReturnValue(mockUser),
      };
      const req = { user: userWithToJSON };

      const result = await controller.getProfile(req);

      const expectedResult = { ...mockUser };
      delete expectedResult.password;

      expect(result).toEqual(expectedResult);
      expect(userWithToJSON.toJSON).toHaveBeenCalled();
    });
  });
});
