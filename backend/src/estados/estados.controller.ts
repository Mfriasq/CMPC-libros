import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EstadosService } from "./estados.service";
import { Estado } from "./estado.model";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user.model";

@ApiTags("estados")
@Controller("estados")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EstadosController {
  constructor(private readonly estadosService: EstadosService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Obtener todos los estados" })
  @ApiResponse({ status: 200, description: "Lista de estados", type: [Estado] })
  async findAll(): Promise<Estado[]> {
    return this.estadosService.findAll();
  }
}
