import { Test, TestingModule } from "@nestjs/testing";
import { GenerosService } from "./generos.service";
import { getModelToken } from "@nestjs/sequelize";
import { Genero } from "./genero.model";
import { EstadosService } from "../estados/estados.service";
import { CreateGeneroDto, UpdateGeneroDto } from "./dto/genero.dto";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

describe("GenerosService", () => {
  let service: GenerosService;
  let generoModel: typeof Genero;
  let estadosService: EstadosService;

  const mockGenero = {
    id: 1,
    nombre: "Ficción",
    descripcion: "Libros de ficción",
    estadoId: 1,
    createdAt: new Date("2025-10-05T21:51:11.583Z"),
    updatedAt: new Date("2025-10-05T21:51:11.583Z"),
    fechaEliminacion: null,
    fechaRestauracion: null,
    estado: {
      id: 1,
      nombre: "activo",
    },
    update: jest.fn(),
    save: jest.fn(),
    reload: jest.fn(),
  };

  const mockGeneroModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  const mockEstadosService = {
    getActivoId: jest.fn(),
    getEliminadoId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerosService,
        {
          provide: getModelToken(Genero),
          useValue: mockGeneroModel,
        },
        {
          provide: EstadosService,
          useValue: mockEstadosService,
        },
      ],
    }).compile();

    service = module.get<GenerosService>(GenerosService);
    generoModel = module.get<typeof Genero>(getModelToken(Genero));
    estadosService = module.get<EstadosService>(EstadosService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new género successfully", async () => {
      const createGeneroDto: CreateGeneroDto = {
        nombre: "Nuevo Género",
        descripcion: "Descripción del nuevo género",
      };

      const mockNewGenero = {
        id: 1,
        nombre: "Nuevo Género",
        descripcion: "Descripción del nuevo género",
        estadoId: 1,
        createdAt: new Date("2025-10-05T21:51:11.583Z"),
        updatedAt: new Date("2025-10-05T21:51:11.583Z"),
        fechaEliminacion: null,
        fechaRestauracion: null,
        save: jest.fn(),
        reload: jest.fn(),
      };

      mockGeneroModel.create.mockResolvedValue(mockNewGenero);
      mockEstadosService.getActivoId.mockResolvedValue(1);

      const result = await service.create(createGeneroDto);

      expect(result).toEqual(mockNewGenero);
      expect(estadosService.getActivoId).toHaveBeenCalled();
      expect(generoModel.create).toHaveBeenCalledWith({
        ...createGeneroDto,
        estadoId: 1,
      });
    });
  });

  describe("findAll", () => {
    it("should return all géneros without pagination", async () => {
      const mockGeneros = [mockGenero];
      mockGeneroModel.findAll.mockResolvedValue(mockGeneros);

      const result = await service.findAll();

      expect(result).toEqual(mockGeneros);
      expect(generoModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: expect.anything(),
            as: "estado",
          },
        ],
        order: [["nombre", "ASC"]],
      });
    });

    it("should return paginated géneros", async () => {
      const mockPaginatedResponse = {
        rows: [mockGenero],
        count: 1,
      };

      mockGeneroModel.findAndCountAll.mockResolvedValue(mockPaginatedResponse);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [mockGenero],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe("findOne", () => {
    it("should return a género by ID", async () => {
      mockGeneroModel.findOne.mockResolvedValue(mockGenero);

      const result = await service.findOne(1);

      expect(result).toEqual(mockGenero);
      expect(generoModel.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: expect.anything(),
            as: "estado",
          },
        ],
      });
    });

    it("should throw NotFoundException when género not found", async () => {
      mockGeneroModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("Género con ID 999 no encontrado")
      );
    });
  });

  describe("service existence", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should have all required methods", () => {
      expect(typeof service.create).toBe("function");
      expect(typeof service.findAll).toBe("function");
      expect(typeof service.findOne).toBe("function");
      expect(typeof service.update).toBe("function");
      expect(typeof service.remove).toBe("function");
      expect(typeof service.restore).toBe("function");
    });
  });
});
