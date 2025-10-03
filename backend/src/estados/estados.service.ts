import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Estado } from "./estado.model";

@Injectable()
export class EstadosService {
  constructor(
    @InjectModel(Estado)
    private estadoModel: typeof Estado
  ) {}

  async findAll(): Promise<Estado[]> {
    return this.estadoModel.findAll({
      order: [["nombre", "ASC"]],
    });
  }

  async findOne(id: number): Promise<Estado> {
    return this.estadoModel.findByPk(id);
  }

  async findByNombre(nombre: string): Promise<Estado> {
    return this.estadoModel.findOne({ where: { nombre } });
  }

  async getActivoId(): Promise<number> {
    const estadoActivo = await this.estadoModel.findOne({
      where: { nombre: "activo" },
    });
    return estadoActivo?.id || 1;
  }

  async getEliminadoId(): Promise<number> {
    const estadoEliminado = await this.estadoModel.findOne({
      where: { nombre: "eliminado" },
    });
    return estadoEliminado?.id || 2;
  }
}
