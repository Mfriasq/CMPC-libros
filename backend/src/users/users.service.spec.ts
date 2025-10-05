import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/sequelize";
import { UsersService } from "./users.service";
import { User } from "./user.model";
import { EstadosService } from "../estados/estados.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { Estado } from "../estados/estado.model";
import { UserRole } from "./user.model";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UsersService", () => {
  let service: UsersService;
  let userModel: any;
  let estadosService: EstadosService;

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    role: "ADMIN",
    age: 30,
    estadoId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    estado: {
      id: 1,
      nombre: "activo",
    },
    update: jest.fn(),
  };

  const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockEstadosService = {
    getActivoId: jest.fn(),
    getEliminadoId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: EstadosService,
          useValue: mockEstadosService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User));
    estadosService = module.get<EstadosService>(EstadosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createUserDto: CreateUserDto = {
      name: "New User",
      email: "newuser@biblioteca.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      role: UserRole.USER,
      age: 25,
    };

    it("should create a new user successfully", async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockEstadosService.getActivoId.mockResolvedValue(1);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: "hashedPassword",
        estadoId: 1,
      });
    });

    it("should throw ConflictException if user already exists and is active", async () => {
      const existingUser = {
        ...mockUser,
        estado: { nombre: "activo" },
      };
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });

    it("should throw ConflictException if user exists but is deleted", async () => {
      const deletedUser = {
        ...mockUser,
        estado: { nombre: "eliminado" },
      };
      mockUserModel.findOne.mockResolvedValue(deletedUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const users = [mockUser];
      mockUserModel.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(userModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: Estado,
            as: "estado",
          },
        ],
      });
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(userModel.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Estado,
            as: "estado",
          },
        ],
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    const updateUserDto: UpdateUserDto = {
      name: "Updated User",
      age: 35,
    };

    it("should update a user successfully", async () => {
      const userToUpdate = {
        ...mockUser,
        update: jest.fn(),
      };

      // Simular que el objeto se actualiza en el lugar
      userToUpdate.update.mockImplementation((updateData) => {
        Object.assign(userToUpdate, updateData);
        return Promise.resolve();
      });

      mockUserModel.findByPk.mockResolvedValueOnce(userToUpdate);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(userToUpdate);
      expect(userToUpdate.update).toHaveBeenCalledWith(updateUserDto);
    });

    it("should hash password if provided in update", async () => {
      const updateWithPassword = {
        ...updateUserDto,
        password: "newPassword123",
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockUser.update.mockResolvedValue(mockUser);

      await service.update(1, updateWithPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(mockUser.update).toHaveBeenCalledWith({
        ...updateUserDto,
        password: "newHashedPassword",
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a user", async () => {
      const userToRemove = {
        ...mockUser,
        update: jest.fn(),
      };

      mockUserModel.findByPk.mockResolvedValueOnce(userToRemove);
      mockEstadosService.getEliminadoId.mockResolvedValue(2);
      userToRemove.update.mockResolvedValue(userToRemove);

      await service.remove(1);

      expect(userToRemove.update).toHaveBeenCalledWith({ estadoId: 2 });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("restore", () => {
    it("should restore a deleted user", async () => {
      const deletedUser = {
        ...mockUser,
        estado: { nombre: "eliminado" },
        update: jest.fn(),
      };

      // Simular que el objeto se actualiza en el lugar
      deletedUser.update.mockImplementation((updateData) => {
        deletedUser.estadoId = updateData.estadoId;
        (deletedUser.estado as any) = {
          id: updateData.estadoId,
          nombre: "activo",
        };
        return Promise.resolve();
      });

      mockUserModel.findByPk.mockResolvedValue(deletedUser);
      mockEstadosService.getActivoId.mockResolvedValue(1);

      const result = await service.restore(1);

      expect(deletedUser.update).toHaveBeenCalledWith({ estadoId: 1 });
      expect(result).toEqual(deletedUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("search", () => {
    it("should search users by query", async () => {
      const searchResults = [mockUser];
      mockUserModel.findAll.mockResolvedValue(searchResults);

      const result = await service.search("test");

      expect(result).toEqual(searchResults);
      expect(userModel.findAll).toHaveBeenCalled();
    });
  });
});
