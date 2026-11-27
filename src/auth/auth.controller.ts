import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioAtual } from '../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService, RespostaLogin } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { UsuarioAutenticado } from './strategies/jwt.strategy';

@ApiTags('Autenticação')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Rota pública. Confere e-mail e senha e devolve o token JWT, que deve ser enviado no cabeçalho Authorization das demais rotas.',
  })
  @ApiResponse({ status: 200, description: 'Login realizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos' })
  login(@Body() dto: LoginDto): Promise<RespostaLogin> {
    return this.authService.login(dto);
  }

  @Get('/perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver usuário logado',
    description: 'Devolve os dados do usuário dono do token enviado.',
  })
  @ApiResponse({ status: 200, description: 'Usuário autenticado' })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou vencido',
  })
  perfil(@UsuarioAtual() usuario: UsuarioAutenticado): UsuarioAutenticado {
    return usuario;
  }
}
