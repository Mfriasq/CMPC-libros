import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import { User } from "./user.model";
import { Estado } from "../estados/estado.model";
import { EstadosService } from "../estados/estados.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private estadosService: EstadosService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("El email ya está registrado");
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds
    );

    // Obtener ID del estado activo por defecto
    const estadoActivoId = await this.estadosService.getActivoId();

    // Crear usuario con contraseña hasheada y estado activo
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      estadoId: estadoActivoId,
    };

    return await this.userModel.create(userData);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.findAll({
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });
  }

  async findAllActive(): Promise<User[]> {
    const estadoActivoId = await this.estadosService.getActivoId();
    return await this.userModel.findAll({
      where: { estadoId: estadoActivoId },
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se está actualizando la contraseña, hashearla
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds
      );
    }

    await user.update(updateData);
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    const estadoEliminadoId = await this.estadosService.getEliminadoId();

    // Cambiar estado a eliminado en lugar de eliminar físicamente
    await user.update({ estadoId: estadoEliminadoId });
  }

  async restore(id: number): Promise<User> {
    const user = await this.findOne(id);
    const estadoActivoId = await this.estadosService.getActivoId();

    // Cambiar estado a activo
    await user.update({ estadoId: estadoActivoId });
    return user;
  }

  async search(query: string): Promise<User[]> {
    const { Op } = require("sequelize");
    return await this.userModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
    });
  }
}
