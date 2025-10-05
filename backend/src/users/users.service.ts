import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import { User } from "./user.model";
import { Estado } from "../estados/estado.model";
import { EstadosService } from "../estados/estados.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from "./dto/user.dto";

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

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await this.userModel.findAndCountAll({
      include: [
        {
          model: Estado,
          as: "estado",
        },
      ],
      order: [
        ["createdAt", "DESC"], // Más recientes primero
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

    // Actualizar datos del usuario (sin contraseña)
    await user.update(updateUserDto);
    return user;
  }

  // Método separado para cambiar contraseña
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const user = await this.findOne(userId);

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("La contraseña actual es incorrecta");
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds
    );

    // Actualizar contraseña
    await user.update({ password: hashedPassword });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    const estadoEliminadoId = await this.estadosService.getEliminadoId();

    // Cambiar estado a eliminado, establecer deletedAt y limpiar restoredAt
    await user.update({
      estadoId: estadoEliminadoId,
      deletedAt: new Date(),
      restoredAt: null,
    });
  }

  async restore(id: number): Promise<User> {
    const user = await this.findOne(id);
    const estadoActivoId = await this.estadosService.getActivoId();

    // Cambiar estado a activo, limpiar deletedAt y establecer restoredAt
    await user.update({
      estadoId: estadoActivoId,
      deletedAt: null,
      restoredAt: new Date(),
    });
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
