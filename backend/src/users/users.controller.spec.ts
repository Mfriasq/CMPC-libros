import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
import { UserRole } from "./user.model";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    role: UserRole.USER,
    age: 30,
    estadoId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    estado: {
      id: 1,
      nombre: "activo",
    },
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        role: UserRole.USER,
        age: 25,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it("should throw ConflictException if user already exists", async () => {
      const createUserDto: CreateUserDto = {
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
        role: UserRole.USER,
        age: 25,
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException("El email ya está registrado")
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException("Usuario no encontrado")
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated User",
        age: 35,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it("should throw NotFoundException if user not found", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated User",
      };

      mockUsersService.update.mockRejectedValue(
        new NotFoundException("Usuario no encontrado")
      );

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException("Usuario no encontrado")
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("restore", () => {
    it("should restore a deleted user", async () => {
      mockUsersService.restore.mockResolvedValue(mockUser);

      const result = await controller.restore(1);

      expect(result).toEqual(mockUser);
      expect(service.restore).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUsersService.restore.mockRejectedValue(
        new NotFoundException("Usuario no encontrado")
      );

      await expect(controller.restore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("search", () => {
    it("should search users by query", async () => {
      const searchResults = [mockUser];
      mockUsersService.search.mockResolvedValue(searchResults);

      const result = await controller.search("test");

      expect(result).toEqual(searchResults);
      expect(service.search).toHaveBeenCalledWith("test");
    });

    it("should return empty array if no users found", async () => {
      mockUsersService.search.mockResolvedValue([]);

      const result = await controller.search("nonexistent");

      expect(result).toEqual([]);
      expect(service.search).toHaveBeenCalledWith("nonexistent");
    });
  });
});
