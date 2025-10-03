import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Libro } from "./libro.model";
import { CreateLibroDto, UpdateLibroDto } from "./dto/libro.dto";
import { Genero } from "../generos/genero.model";
import { Estado } from "../estados/estado.model";
import { EstadosService } from "../estados/estados.service";

@Injectable()
export class LibrosService {
  constructor(
    @InjectModel(Libro)
    private libroModel: typeof Libro,
    private estadosService: EstadosService
  ) {}

  async create(crearLibroDto: CreateLibroDto): Promise<Libro> {
    // Verificar si el libro y editorial ya existen
    const existeLibro = await this.libroModel.findOne({
      where: {
        titulo: crearLibroDto.titulo,
        editorial: crearLibroDto.editorial,
      },
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });

    if (existeLibro) {
      if (existeLibro.estado.nombre === "eliminado") {
        throw new ConflictException(
          `Ya existe un libro con ese título y editorial, pero se encuentra eliminado. Use el endpoint de restauración para activarlo nuevamente.`
        );
      } else {
        throw new ConflictException(
          `Ya existe un libro con ese título y editorial`
        );
      }
    }

    // Obtener ID del estado activo
    const estadoActivoId = await this.estadosService.getActivoId();

    return await this.libroModel.create({
      ...crearLibroDto,
      estadoId: estadoActivoId,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Libro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { literal } = require("sequelize");
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await this.libroModel.findAndCountAll({
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
      order: [
        // Primero por estado: ACTIVO primero, luego ELIMINADO
        literal(`CASE 
          WHEN "estado"."nombre" = 'activo' THEN 1 
          WHEN "estado"."nombre" = 'eliminado' THEN 2 
          ELSE 3 
        END`),
        // Luego alfabéticamente por título
        literal(`lower(titulo) ASC`),
      ],
      offset,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.libroModel.findOne({
      where: {
        id,
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
    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado.`);
    }
    return libro;
  }

  async update(id: number, updateLibroDto: UpdateLibroDto): Promise<Libro> {
    const libro = await this.findOne(id);
    await libro.update(updateLibroDto);
    return libro;
  }

  async eliminar(id: number): Promise<void> {
    const libro = await this.findOne(id);

    // Verificar que el libro no esté ya eliminado
    if (libro.estado.nombre === "eliminado") {
      throw new ConflictException(
        `El libro con ID ${id} ya se encuentra eliminado`
      );
    }

    // Obtener ID del estado eliminado
    const estadoEliminadoId = await this.estadosService.getEliminadoId();

    // Soft delete: cambiar estado a ELIMINADO, establecer fecha de eliminación y limpiar fecha de restauración
    await libro.update({
      estadoId: estadoEliminadoId,
      fechaEliminacion: new Date(),
      fechaRestauracion: null,
    });
  }

  async restaurar(id: number): Promise<Libro> {
    const libro = await this.findOne(id);

    // Verificar que el libro esté eliminado
    if (libro.estado.nombre !== "eliminado") {
      throw new ConflictException(
        `El libro con ID ${id} no se encuentra eliminado`
      );
    }

    // Obtener ID del estado activo
    const estadoActivoId = await this.estadosService.getActivoId();

    // Restaurar: cambiar estado a ACTIVO, limpiar fecha de eliminación y establecer fecha de restauración
    await libro.update({
      estadoId: estadoActivoId,
      fechaEliminacion: null,
      fechaRestauracion: new Date(),
    });

    return libro;
  }

  // Buscar libros por múltiples criterios (insensible a acentos y tildes)
  async search(
    searchParams: {
      titulo?: string;
      autor?: string;
      editorial?: string;
      generoId?: number;
      estado?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Libro[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { Op, literal } = require("sequelize");
    const whereConditions: any = {};

    if (searchParams.titulo) {
      // Búsqueda insensible a acentos usando unaccent
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push(
        literal(
          `unaccent(lower(titulo)) ILIKE unaccent(lower('%${searchParams.titulo}%'))`
        )
      );
    }

    if (searchParams.autor) {
      // Búsqueda insensible a acentos usando unaccent
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push(
        literal(
          `unaccent(lower(autor)) ILIKE unaccent(lower('%${searchParams.autor}%'))`
        )
      );
    }

    if (searchParams.editorial) {
      // Búsqueda insensible a acentos usando unaccent
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push(
        literal(
          `unaccent(lower(editorial)) ILIKE unaccent(lower('%${searchParams.editorial}%'))`
        )
      );
    }

    if (searchParams.generoId) {
      whereConditions.generoId = searchParams.generoId;
    }

    if (searchParams.estado) {
      // Búsqueda por estado usando join con tabla estados
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push(
        literal(`"estado"."nombre" = '${searchParams.estado}'`)
      );
    }

    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await this.libroModel.findAndCountAll({
      where: whereConditions,
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
      order: [
        // Primero por estado: ACTIVO primero, luego ELIMINADO
        literal(`CASE 
          WHEN "estado"."nombre" = 'activo' THEN 1 
          WHEN "estado"."nombre" = 'eliminado' THEN 2 
          ELSE 3 
        END`),
        // Luego alfabéticamente por título (insensible a mayúsculas)
        literal(`lower(titulo) ASC`),
      ],
      offset,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateImagenUrl(id: number, imagenUrl: string): Promise<Libro> {
    const libro = await this.findOne(id);
    await libro.update({ imagenUrl });
    return libro;
  }

  async removeImagen(id: number): Promise<Libro> {
    const libro = await this.findOne(id);
    await libro.update({ imagenUrl: null });
    return libro;
  }

  async exportToCsv(filters: {
    titulo?: string;
    autor?: string;
    editorial?: string;
    generoId?: number;
    estado?: string;
  }): Promise<string> {
    const { Op } = require("sequelize");

    // Construir condiciones de búsqueda usando la misma lógica que search()
    const whereConditions: any = {};
    const estadoWhereConditions: any = {};

    if (filters.titulo) {
      whereConditions.titulo = { [Op.iLike]: `%${filters.titulo}%` };
    }

    if (filters.autor) {
      whereConditions.autor = { [Op.iLike]: `%${filters.autor}%` };
    }

    if (filters.editorial) {
      whereConditions.editorial = { [Op.iLike]: `%${filters.editorial}%` };
    }

    if (filters.generoId) {
      whereConditions.generoId = filters.generoId;
    }

    if (filters.estado) {
      estadoWhereConditions.nombre = { [Op.iLike]: `%${filters.estado}%` };
    }

    // Obtener todos los libros que coincidan con los filtros
    const libros = await this.libroModel.findAll({
      where: whereConditions,
      include: [
        {
          model: Genero,
          as: "genero",
          attributes: ["nombre"],
        },
        {
          model: Estado,
          as: "estado",
          attributes: ["nombre"],
          where:
            Object.keys(estadoWhereConditions).length > 0
              ? estadoWhereConditions
              : undefined,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Generar contenido CSV
    const headers = [
      "ID",
      "Título",
      "Autor",
      "Editorial",
      "Precio",
      "Género",
      "Estado",
      "Disponibilidad",
      "Fecha Creación",
      "Fecha Actualización",
    ];

    let csvContent = headers.join(",") + "\n";

    for (const libro of libros) {
      const row = [
        libro.id,
        `"${libro.titulo.replace(/"/g, '""')}"`, // Escapar comillas dobles
        `"${libro.autor.replace(/"/g, '""')}"`,
        `"${libro.editorial.replace(/"/g, '""')}"`,
        libro.precio,
        `"${libro.genero?.nombre || "Sin género"}"`,
        `"${libro.estado.nombre}"`,
        libro.disponibilidad,
        libro.createdAt.toISOString().split("T")[0], // Solo fecha, sin hora
        libro.updatedAt.toISOString().split("T")[0],
      ];
      csvContent += row.join(",") + "\n";
    }

    return csvContent;
  }
}
