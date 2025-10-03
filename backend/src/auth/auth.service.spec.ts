import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/sequelize";
import { AuthService } from "./auth.service";
import { User } from "../users/user.model";
import { UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/auth.dto";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    role: "ADMIN",
    age: 30,
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should return access token and user data when credentials are valid", async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token-here");

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: "jwt-token-here",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          age: mockUser.age,
          role: mockUser.role,
        },
      });
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Credenciales inválidas"
      );
    });

    it("should throw UnauthorizedException when password is incorrect", async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Credenciales inválidas"
      );
    });
  });

  describe("validateUser", () => {
    it("should return user when found", async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
      expect(userModel.findByPk).toHaveBeenCalledWith(1);
    });

    it("should return null when user is not found", async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(result).toBeNull();
      expect(userModel.findByPk).toHaveBeenCalledWith(999);
    });
  });
});
