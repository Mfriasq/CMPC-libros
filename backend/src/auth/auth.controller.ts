import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, AuthResponseDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "../users/user.model";
import { LoggingService } from "../logging/logging.service";
import { AuditAuth } from "../logging/audit.decorator";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @AuditAuth("LOGIN_ATTEMPT")
  @ApiOperation({ summary: "Iniciar sesión" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login exitoso.",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciales inválidas.",
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos.",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any
  ): Promise<AuthResponseDto> {
    try {
      const result = await this.authService.login(loginDto);

      // Log de login exitoso
      this.loggingService.auditAuth(
        "LOGIN_SUCCESS",
        result.user.id,
        result.user.email,
        true,
        {
          role: result.user.role,
          loginTime: new Date().toISOString(),
        },
        req
      );

      return result;
    } catch (error) {
      // Log de login fallido
      this.loggingService.auditAuth(
        "LOGIN_FAILURE",
        undefined,
        loginDto.email,
        false,
        {
          error: error.message,
          attemptTime: new Date().toISOString(),
        },
        req
      );

      // Log de seguridad para intentos fallidos
      this.loggingService.auditSecurity(
        "FAILED_LOGIN_ATTEMPT",
        {
          email: loginDto.email,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        req
      );

      throw error;
    }
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener perfil del usuario autenticado" })
  @ApiResponse({
    status: 200,
    description: "Perfil del usuario.",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async getProfile(@Request() req): Promise<Omit<User, "password">> {
    const user = req.user;
    // Excluir la contraseña de la respuesta
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cerrar sesión del usuario autenticado" })
  @ApiResponse({
    status: 200,
    description: "Sesión cerrada exitosamente.",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Sesión cerrada exitosamente",
        },
        timestamp: {
          type: "string",
          format: "date-time",
          example: "2025-10-02T13:45:30.123Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token requerido.",
  })
  async logout(
    @Request() req
  ): Promise<{ message: string; timestamp: string }> {
    // En una implementación JWT stateless, el logout es del lado del cliente
    // El servidor puede registrar el evento para auditoría
    const user = req.user;

    // Aquí se podría implementar:
    // 1. Blacklist del token (requiere redis/cache)
    // 2. Log de auditoría
    // 3. Invalidar refresh tokens si los hay

    return {
      message: "Sesión cerrada exitosamente",
      timestamp: new Date().toISOString(),
    };
  }
}
