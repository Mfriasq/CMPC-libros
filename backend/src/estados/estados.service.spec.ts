import { Test, TestingModule } from "@nestjs/testing";
import { EstadosService } from "./estados.service";
import { getModelToken } from "@nestjs/sequelize";
import { Estado } from "./estado.model";

describe("EstadosService", () => {
  let service: EstadosService;
  let estadoModel: typeof Estado;

  const mockEstado = {
    id: 1,
    nombre: "activo",
    createdAt: new Date("2025-10-05T21:51:11.583Z"),
    updatedAt: new Date("2025-10-05T21:51:11.583Z"),
  };

  const mockEstadoModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadosService,
        {
          provide: getModelToken(Estado),
          useValue: mockEstadoModel,
        },
      ],
    }).compile();

    service = module.get<EstadosService>(EstadosService);
    estadoModel = module.get<typeof Estado>(getModelToken(Estado));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all estados", async () => {
      const mockEstados = [
        mockEstado,
        { ...mockEstado, id: 2, nombre: "eliminado" },
      ];
      mockEstadoModel.findAll.mockResolvedValue(mockEstados);

      const result = await service.findAll();

      expect(result).toEqual(mockEstados);
      expect(mockEstadoModel.findAll).toHaveBeenCalledWith({
        order: [["nombre", "ASC"]],
      });
    });
  });

  describe("findOne", () => {
    it("should return a estado when found", async () => {
      mockEstadoModel.findByPk.mockResolvedValue(mockEstado);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEstado);
      expect(mockEstadoModel.findByPk).toHaveBeenCalledWith(1);
    });

    it("should return null when estado not found", async () => {
      mockEstadoModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(mockEstadoModel.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe("getActivoId", () => {
    it("should return activo estado ID when found", async () => {
      mockEstadoModel.findOne.mockResolvedValue(mockEstado);

      const result = await service.getActivoId();

      expect(result).toBe(1);
      expect(mockEstadoModel.findOne).toHaveBeenCalledWith({
        where: { nombre: "activo" },
      });
    });

    it("should return default ID (1) when activo estado not found", async () => {
      mockEstadoModel.findOne.mockResolvedValue(null);

      const result = await service.getActivoId();

      expect(result).toBe(1);
    });
  });

  describe("getEliminadoId", () => {
    it("should return eliminado estado ID when found", async () => {
      const eliminadoEstado = { ...mockEstado, id: 2, nombre: "eliminado" };
      mockEstadoModel.findOne.mockResolvedValue(eliminadoEstado);

      const result = await service.getEliminadoId();

      expect(result).toBe(2);
      expect(mockEstadoModel.findOne).toHaveBeenCalledWith({
        where: { nombre: "eliminado" },
      });
    });

    it("should return default ID (2) when eliminado estado not found", async () => {
      mockEstadoModel.findOne.mockResolvedValue(null);

      const result = await service.getEliminadoId();

      expect(result).toBe(2);
    });
  });

  describe("findByNombre", () => {
    it("should return estado by nombre", async () => {
      mockEstadoModel.findOne.mockResolvedValue(mockEstado);

      const result = await service.findByNombre("activo");

      expect(result).toEqual(mockEstado);
      expect(mockEstadoModel.findOne).toHaveBeenCalledWith({
        where: { nombre: "activo" },
      });
    });
  });
});
