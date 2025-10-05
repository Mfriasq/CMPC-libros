import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Genero } from "./genero.model";
import { Estado } from "../estados/estado.model";
import { EstadosService } from "../estados/estados.service";
import { CreateGeneroDto, UpdateGeneroDto } from "./dto/genero.dto";

@Injectable()
export class GenerosService {
  constructor(
    @InjectModel(Genero)
    private generoModel: typeof Genero,
    private estadosService: EstadosService
  ) {}

  async findAll(
    page?: number,
    limit?: number
  ): Promise<
    | Genero[]
    | {
        data: Genero[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
  > {
    // Si no se especifica paginación, devolver todos los géneros (para mantener compatibilidad)
    if (!page || !limit) {
      return this.generoModel.findAll({
        include: [
          {
            model: Estado,
            as: "estado",
          },
        ],
        order: [["nombre", "ASC"]],
      });
    }

    // Con paginación
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await this.generoModel.findAndCountAll(
      {
        include: [
          {
            model: Estado,
            as: "estado",
          },
        ],
        order: [["nombre", "ASC"]],
        offset,
        limit,
      }
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Genero> {
    const genero = await this.generoModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });

    if (!genero) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return genero;
  }

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    const estadoActivoId = await this.estadosService.getActivoId();

    return this.generoModel.create({
      ...createGeneroDto,
      estadoId: estadoActivoId,
    });
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto): Promise<Genero> {
    const genero = await this.findOne(id);
    await genero.update(updateGeneroDto);
    return genero;
  }

  async remove(id: number): Promise<void> {
    const genero = await this.findOne(id);

    if (genero.estado.nombre === "eliminado") {
      throw new ConflictException(
        `El género con ID ${id} ya se encuentra eliminado`
      );
    }

    const estadoEliminadoId = await this.estadosService.getEliminadoId();

    await genero.update({
      estadoId: estadoEliminadoId,
    });
  }

  async restore(id: number): Promise<Genero> {
    const genero = await this.findOne(id);

    if (genero.estado.nombre !== "eliminado") {
      throw new ConflictException(
        `El género con ID ${id} no se encuentra eliminado`
      );
    }

    const estadoActivoId = await this.estadosService.getActivoId();

    await genero.update({
      estadoId: estadoActivoId,
    });

    return genero;
  }
}
