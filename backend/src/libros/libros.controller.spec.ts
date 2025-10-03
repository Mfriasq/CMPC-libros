import { Test, TestingModule } from "@nestjs/testing";
import { LibrosController } from "./libros.controller";
import { LibrosService } from "./libros.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { CreateLibroDto, UpdateLibroDto } from "./dto/libro.dto";
import { Libro } from "./libro.model";
import { Response } from "express";
import { BadRequestException } from "@nestjs/common";

describe("LibrosController", () => {
  let controller: LibrosController;
  let service: LibrosService;

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
      descripcion: "Libros de ficción",
      estadoId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      fechaEliminacion: null,
      fechaRestauracion: null,
      estado: null,
    },
  };

  const mockLibrosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    eliminar: jest.fn(),
    restaurar: jest.fn(),
    search: jest.fn(),
    updateImagenUrl: jest.fn(),
    exportToCsv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrosController],
      providers: [
        {
          provide: LibrosService,
          useValue: mockLibrosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LibrosController>(LibrosController);
    service = module.get<LibrosService>(LibrosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new libro", async () => {
      const createLibroDto: CreateLibroDto = {
        titulo: "New Book",
        autor: "New Author",
        editorial: "New Editorial",
        precio: 30000,
        generoId: 1,
        disponibilidad: 3,
      };

      mockLibrosService.create.mockResolvedValue(mockLibro);

      const result = await controller.create(createLibroDto);

      expect(result).toEqual(mockLibro);
      expect(service.create).toHaveBeenCalledWith(createLibroDto);
    });
  });

  describe("findAll", () => {
    it("should return paginated libros", async () => {
      const paginatedResponse = {
        data: [mockLibro],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockLibrosService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("findOne", () => {
    it("should return a libro by id", async () => {
      mockLibrosService.findOne.mockResolvedValue(mockLibro);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockLibro);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe("update", () => {
    it("should update a libro", async () => {
      const updateLibroDto: UpdateLibroDto = {
        titulo: "Updated Book",
        precio: 35000,
      };

      const updatedLibro = { ...mockLibro, ...updateLibroDto };
      mockLibrosService.update.mockResolvedValue(updatedLibro);

      const result = await controller.update(1, updateLibroDto);

      expect(result).toEqual(updatedLibro);
      expect(service.update).toHaveBeenCalledWith(1, updateLibroDto);
    });
  });

  describe("remove", () => {
    it("should remove a libro", async () => {
      mockLibrosService.eliminar.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toBeUndefined();
      expect(service.eliminar).toHaveBeenCalledWith(1);
    });
  });

  describe("restore", () => {
    it("should restore a libro", async () => {
      mockLibrosService.restaurar.mockResolvedValue(mockLibro);

      const result = await controller.restore(1);

      expect(result).toEqual(mockLibro);
      expect(service.restaurar).toHaveBeenCalledWith(1);
    });
  });

  describe("search", () => {
    it("should search libros with filters", async () => {
      const searchResponse = {
        data: [mockLibro],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockLibrosService.search.mockResolvedValue(searchResponse);

      const result = await controller.search(
        "Test",
        "Author",
        "Editorial",
        1,
        "activo",
        1,
        10
      );

      expect(result).toEqual(searchResponse);
      expect(service.search).toHaveBeenCalledWith(
        {
          titulo: "Test",
          autor: "Author",
          editorial: "Editorial",
          generoId: 1,
          estado: "activo",
        },
        1,
        10
      );
    });
  });

  describe("uploadImagen", () => {
    it("should upload an image for a libro", async () => {
      const mockFile = {
        fieldname: "imagen",
        originalname: "test.jpg",
        filename: "test-123.jpg",
        mimetype: "image/jpeg",
        size: 1024,
      };

      const expectedResponse = {
        message: "Imagen subida exitosamente",
        imagenUrl: "/uploads/libros/test-123.jpg",
      };

      mockLibrosService.updateImagenUrl.mockResolvedValue(mockLibro);

      const result = await controller.uploadImagen(1, mockFile);

      expect(result).toEqual(expectedResponse);
      expect(service.updateImagenUrl).toHaveBeenCalledWith(
        1,
        "/uploads/libros/test-123.jpg"
      );
    });

    it("should throw BadRequestException when no file is provided", async () => {
      await expect(controller.uploadImagen(1, null)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("exportToCsv", () => {
    it("should export libros to CSV", async () => {
      const csvContent = "ID,Título,Autor\n1,Test Book,Test Author\n";
      const mockResponse = {
        send: jest.fn(),
      } as unknown as Response;

      mockLibrosService.exportToCsv.mockResolvedValue(csvContent);

      await controller.exportToCsv(
        mockResponse,
        "Test",
        "Author",
        "Editorial",
        1,
        "activo"
      );

      expect(service.exportToCsv).toHaveBeenCalledWith({
        titulo: "Test",
        autor: "Author",
        editorial: "Editorial",
        generoId: 1,
        estado: "activo",
      });
      expect(mockResponse.send).toHaveBeenCalledWith(csvContent);
    });
  });
});
