import { Test, TestingModule } from "@nestjs/testing";
import { EstadosController } from "./estados.controller";
import { EstadosService } from "./estados.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("EstadosController", () => {
  let controller: EstadosController;
  let service: EstadosService;

  const mockEstado = {
    id: 1,
    nombre: "activo",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstadosService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadosController],
      providers: [
        {
          provide: EstadosService,
          useValue: mockEstadosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EstadosController>(EstadosController);
    service = module.get<EstadosService>(EstadosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all estados", async () => {
      const mockEstados = [
        mockEstado,
        { ...mockEstado, id: 2, nombre: "eliminado" },
      ];
      mockEstadosService.findAll.mockResolvedValue(mockEstados);

      const result = await controller.findAll();

      expect(result).toEqual(mockEstados);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no estados exist", async () => {
      mockEstadosService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      mockEstadosService.findAll.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(controller.findAll()).rejects.toThrow(
        "Database connection error"
      );
    });
  });
});
