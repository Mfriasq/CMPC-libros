import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { EstadoLibro, Libro } from "./libro.model";
import { CreateLibroDto, UpdateLibroDto } from "./dto/libro.dto";

@Injectable()
export class LibrosService {
  constructor(
    @InjectModel(Libro)
    private libroModel: typeof Libro
  ) {}

  async create(crearLibroDto: CreateLibroDto): Promise<Libro> {
    // Verificar si el libro y editorial ya existen
    const existeLibro = await this.libroModel.findOne({
      where: {
        titulo: crearLibroDto.titulo,
        editorial: crearLibroDto.editorial,
      },
    });

    if (existeLibro) {
      if (existeLibro.estado === EstadoLibro.ELIMINADO) {
        throw new ConflictException(
          `Ya existe un libro con ese título y editorial, pero se encuentra eliminado. Use el endpoint de restauración para activarlo nuevamente.`
        );
      } else {
        throw new ConflictException(
          `Ya existe un libro con ese título y editorial`
        );
      }
    }
    return await this.libroModel.create({
      ...crearLibroDto,
      estado: EstadoLibro.ACTIVO,
    });
  }

  async findAll(): Promise<Libro[]> {
    return await this.libroModel.findAll();
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.libroModel.findOne({
      where: {
        id,
      },
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
    if (libro.estado === EstadoLibro.ELIMINADO) {
      throw new ConflictException(
        `El libro con ID ${id} ya se encuentra eliminado`
      );
    }

    // Soft delete: cambiar estado a ELIMINADO, establecer fecha de eliminación y limpiar fecha de restauración
    await libro.update({
      estado: EstadoLibro.ELIMINADO,
      fechaEliminacion: new Date(),
      fechaRestauracion: null,
    });
  }

  async restaurar(id: number): Promise<Libro> {
    const libro = await this.findOne(id);

    // Verificar que el libro esté eliminado
    if (libro.estado !== EstadoLibro.ELIMINADO) {
      throw new ConflictException(
        `El libro con ID ${id} no se encuentra eliminado`
      );
    }

    // Restaurar: cambiar estado a ACTIVO, limpiar fecha de eliminación y establecer fecha de restauración
    await libro.update({
      estado: EstadoLibro.ACTIVO,
      fechaEliminacion: null,
      fechaRestauracion: new Date(),
    });

    return libro;
  }

  // Buscar libros por múltiples criterios (insensible a acentos y tildes)
  async search(searchParams: {
    titulo?: string;
    autor?: string;
    editorial?: string;
    genero?: string;
  }): Promise<Libro[]> {
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

    if (searchParams.genero) {
      // Para género usamos búsqueda exacta pero también insensible a acentos
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push(
        literal(
          `unaccent(lower(genero)) = unaccent(lower('${searchParams.genero}'))`
        )
      );
    }

    return await this.libroModel.findAll({
      where: whereConditions,
    });
  }
}
