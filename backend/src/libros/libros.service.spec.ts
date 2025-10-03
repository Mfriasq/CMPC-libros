import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/sequelize";
import { LibrosService } from "./libros.service";
import { Libro } from "./libro.model";
import { EstadosService } from "../estados/estados.service";
import { CreateLibroDto, UpdateLibroDto } from "./dto/libro.dto";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { Genero } from "../generos/genero.model";
import { Estado } from "../estados/estado.model";

describe("LibrosService", () => {
  let service: LibrosService;
  let libroModel: any;
  let estadosService: EstadosService;

  const mockLibro = {
    id: 1,
    titulo: "Test Book",
    autor: "Test Author",
    editorial: "Test Editorial",
    precio: 25000,
    disponibilidad: 5,
    generoId: 1,
    estadoId: 1,
    imagenUrl: "/test-image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    fechaEliminacion: null,
    fechaRestauracion: null,
    estado: {
      id: 1,
      nombre: "activo",
    },
    genero: {
      id: 1,
      nombre: "Ficción",
    },
    update: jest.fn(),
    destroy: jest.fn(),
    restore: jest.fn(),
  };

  const mockLibroModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    sequelize: {
      Sequelize: {
        Op: {
          iLike: Symbol("iLike"),
          or: Symbol("or"),
        },
      },
    },
  };

  const mockEstadosService = {
    getActivoId: jest.fn(),
    getEliminadoId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibrosService,
        {
          provide: getModelToken(Libro),
          useValue: mockLibroModel,
        },
        {
          provide: EstadosService,
          useValue: mockEstadosService,
        },
      ],
    }).compile();

    service = module.get<LibrosService>(LibrosService);
    libroModel = module.get(getModelToken(Libro));
    estadosService = module.get<EstadosService>(EstadosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    const createLibroDto: CreateLibroDto = {
      titulo: "New Book",
      autor: "New Author",
      editorial: "New Editorial",
      precio: 30000,
      generoId: 1,
      disponibilidad: 3,
    };

    it("should create a new libro successfully", async () => {
      mockLibroModel.findOne.mockResolvedValue(null);
      mockEstadosService.getActivoId.mockResolvedValue(1);
      mockLibroModel.create.mockResolvedValue(mockLibro);

      const result = await service.create(createLibroDto);

      expect(result).toEqual(mockLibro);
      expect(libroModel.create).toHaveBeenCalledWith({
        ...createLibroDto,
        estadoId: 1,
      });
    });

    it("should throw ConflictException if libro already exists and is active", async () => {
      const existingLibro = {
        ...mockLibro,
        estado: { nombre: "activo" },
      };
      mockLibroModel.findOne.mockResolvedValue(existingLibro);

      await expect(service.create(createLibroDto)).rejects.toThrow(
        ConflictException
      );
    });

    it("should throw ConflictException if libro exists but is deleted", async () => {
      const deletedLibro = {
        ...mockLibro,
        estado: { nombre: "eliminado" },
      };
      mockLibroModel.findOne.mockResolvedValue(deletedLibro);

      await expect(service.create(createLibroDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated libros", async () => {
      const paginatedResult = {
        rows: [mockLibro],
        count: 1,
      };

      mockLibroModel.findAndCountAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [mockLibro],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe("findOne", () => {
    it("should return a libro by id", async () => {
      mockLibroModel.findOne.mockResolvedValue(mockLibro);

      const result = await service.findOne(1);

      expect(result).toEqual(mockLibro);
      expect(libroModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: [
          {
            model: Genero,
            as: "genero",
          },
          {
            model: Estado,
            as: "estado",
          },
        ],
      });
    });

    it("should throw NotFoundException if libro not found", async () => {
      mockLibroModel.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    const updateLibroDto: UpdateLibroDto = {
      titulo: "Updated Book",
      precio: 35000,
    };

    it("should update a libro successfully", async () => {
      const libroToUpdate = {
        ...mockLibro,
        update: jest.fn(),
      };

      // Simular que el objeto se actualiza en el lugar
      libroToUpdate.update.mockImplementation((updateData) => {
        Object.assign(libroToUpdate, updateData);
        return Promise.resolve();
      });

      mockLibroModel.findOne.mockResolvedValueOnce(libroToUpdate);

      const result = await service.update(1, updateLibroDto);

      expect(result).toEqual(libroToUpdate);
      expect(libroToUpdate.update).toHaveBeenCalledWith(updateLibroDto);
    });

    it("should throw NotFoundException if libro not found", async () => {
      mockLibroModel.findOne.mockResolvedValueOnce(null);

      await expect(service.update(999, updateLibroDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("eliminar", () => {
    it("should soft delete a libro", async () => {
      const activeLibro = {
        ...mockLibro,
        estado: { nombre: "activo" },
        update: jest.fn().mockResolvedValue(mockLibro),
      };

      // Mock findOne instead of findByPk since eliminar calls findOne
      jest.spyOn(service, "findOne").mockResolvedValueOnce(activeLibro as any);
      mockEstadosService.getEliminadoId.mockResolvedValue(2);

      await service.eliminar(1);

      expect(activeLibro.update).toHaveBeenCalledWith({
        estadoId: 2,
        fechaEliminacion: expect.any(Date),
        fechaRestauracion: null,
      });
    });

    it("should throw NotFoundException if libro not found", async () => {
      jest
        .spyOn(service, "findOne")
        .mockRejectedValueOnce(new NotFoundException());

      await expect(service.eliminar(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("restaurar", () => {
    it("should restore a deleted libro", async () => {
      const deletedLibro = {
        ...mockLibro,
        estado: { nombre: "eliminado" },
        update: jest.fn().mockResolvedValue(mockLibro),
      };

      // Mock findOne to return the deleted libro instead of findByPk
      jest.spyOn(service, "findOne").mockResolvedValue(deletedLibro as any);
      mockEstadosService.getActivoId.mockResolvedValue(1);

      const result = await service.restaurar(1);

      expect(deletedLibro.update).toHaveBeenCalledWith({
        estadoId: 1,
        fechaEliminacion: null,
        fechaRestauracion: expect.any(Date),
      });
      expect(result).toEqual(deletedLibro);
    });

    it("should throw NotFoundException if libro not found", async () => {
      jest
        .spyOn(service, "findOne")
        .mockRejectedValueOnce(new NotFoundException());

      await expect(service.restaurar(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("search", () => {
    it("should search libros with filters", async () => {
      const filters = {
        titulo: "Test",
        autor: "Author",
        editorial: "Editorial",
        generoId: 1,
        estado: "activo",
      };

      const searchResult = {
        rows: [mockLibro],
        count: 1,
      };

      mockLibroModel.findAndCountAll.mockResolvedValue(searchResult);

      const result = await service.search(filters, 1, 10);

      expect(result).toEqual({
        data: [mockLibro],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe("updateImagenUrl", () => {
    it("should update libro image URL", async () => {
      const imageUrl = "/new-image.jpg";
      mockLibroModel.findByPk.mockResolvedValue(mockLibro);
      mockLibro.update.mockResolvedValue({ ...mockLibro, imagenUrl: imageUrl });

      const result = await service.updateImagenUrl(1, imageUrl);

      expect(mockLibro.update).toHaveBeenCalledWith({ imagenUrl: imageUrl });
    });
  });

  describe("exportToCsv", () => {
    it("should export libros to CSV format", async () => {
      const filters = {
        titulo: "Test",
      };

      const librosForExport = [
        {
          id: 1,
          titulo: "Test Book",
          autor: "Test Author",
          editorial: "Test Editorial",
          precio: 25000,
          disponibilidad: 5,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-02"),
          genero: { nombre: "Ficción" },
          estado: { nombre: "activo" },
        },
      ];

      mockLibroModel.findAll.mockResolvedValue(librosForExport);

      const result = await service.exportToCsv(filters);

      expect(result).toContain("ID,Título,Autor,Editorial,Precio");
      expect(result).toContain(
        '1,"Test Book","Test Author","Test Editorial",25000'
      );
      expect(result).toContain('"Ficción","activo",5');
    });
  });
});
