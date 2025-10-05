import { Test, TestingModule } from "@nestjs/testing";
import { GenerosController } from "./generos.controller";
import { GenerosService } from "./generos.service";
import { LoggingService } from "../logging/logging.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { CreateGeneroDto, UpdateGeneroDto } from "./dto/genero.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("GenerosController", () => {
  let controller: GenerosController;
  let service: GenerosService;

  const mockGenero = {
    id: 1,
    nombre: "Ficción",
    descripcion: "Libros de ficción",
    estadoId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    fechaEliminacion: null,
    fechaRestauracion: null,
    estado: {
      id: 1,
      nombre: "activo",
    },
  };

  const mockGenerosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  const mockLoggingService = {
    auditDataChange: jest.fn(),
    logSystemError: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerosController],
      providers: [
        {
          provide: GenerosService,
          useValue: mockGenerosService,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GenerosController>(GenerosController);
    service = module.get<GenerosService>(GenerosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new género", async () => {
      const createGeneroDto: CreateGeneroDto = {
        nombre: "Nuevo Género",
        descripcion: "Descripción del nuevo género",
      };

      mockGenerosService.create.mockResolvedValue(mockGenero);

      const result = await controller.create(createGeneroDto);

      expect(result).toEqual(mockGenero);
      expect(service.create).toHaveBeenCalledWith(createGeneroDto);
    });

    it("should handle service errors during creation", async () => {
      const createGeneroDto: CreateGeneroDto = {
        nombre: "Género Duplicado",
        descripcion: "Descripción",
      };

      mockGenerosService.create.mockRejectedValue(
        new BadRequestException("Género ya existe")
      );

      await expect(controller.create(createGeneroDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("findAll", () => {
    it("should return all géneros", async () => {
      const mockGeneros = [mockGenero];
      mockGenerosService.findAll.mockResolvedValue(mockGeneros);

      const result = await controller.findAll();

      expect(result).toEqual(mockGeneros);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no géneros exist", async () => {
      mockGenerosService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a género by ID", async () => {
      mockGenerosService.findOne.mockResolvedValue(mockGenero);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockGenero);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when género not found", async () => {
      mockGenerosService.findOne.mockRejectedValue(
        new NotFoundException("Género no encontrado")
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a género successfully", async () => {
      const updateGeneroDto: UpdateGeneroDto = {
        nombre: "Género Actualizado",
        descripcion: "Descripción actualizada",
      };

      const updatedGenero = { ...mockGenero, ...updateGeneroDto };
      mockGenerosService.update.mockResolvedValue(updatedGenero);

      const result = await controller.update(1, updateGeneroDto);

      expect(result).toEqual(updatedGenero);
      expect(service.update).toHaveBeenCalledWith(1, updateGeneroDto);
    });

    it("should handle update errors", async () => {
      const updateGeneroDto: UpdateGeneroDto = {
        nombre: "Nombre Duplicado",
      };

      mockGenerosService.update.mockRejectedValue(
        new BadRequestException("Nombre ya existe")
      );

      await expect(controller.update(1, updateGeneroDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a género", async () => {
      const deletedGenero = { ...mockGenero, estadoId: 2 };
      mockGenerosService.remove.mockResolvedValue(deletedGenero);

      const result = await controller.remove(1);

      expect(result).toEqual(deletedGenero);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it("should handle deletion errors", async () => {
      mockGenerosService.remove.mockRejectedValue(
        new NotFoundException("Género no encontrado")
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("restore", () => {
    it("should restore a deleted género", async () => {
      const restoredGenero = { ...mockGenero, fechaRestauracion: new Date() };
      mockGenerosService.restore.mockResolvedValue(restoredGenero);

      const result = await controller.restore(1);

      expect(result).toEqual(restoredGenero);
      expect(service.restore).toHaveBeenCalledWith(1);
    });

    it("should handle restore errors", async () => {
      mockGenerosService.restore.mockRejectedValue(
        new NotFoundException("Género no encontrado")
      );

      await expect(controller.restore(999)).rejects.toThrow(NotFoundException);
    });
  });
});
