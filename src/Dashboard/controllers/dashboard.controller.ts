import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { UsuarioAtual } from '../../common/decorators/usuario-atual.decorator';
import { Perfil } from '../../common/enums/perfil.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfisGuard } from '../../common/guards/perfis.guard';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.COLABORADOR)
@Controller('/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Perfis(Perfil.COLABORADOR, Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard conforme o perfil',
    description:
      'Perfis COLABORADOR e ASSOCIADO. Devolve os indicadores gerais para o colaborador ou o resumo individual para o associado dono do token.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard do perfil' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  obterDashboard(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.dashboardService.obterDashboard(
      usuario.perfil,
      usuario.associadoId ?? undefined,
    );
  }

  @Get('/indicadores')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Indicadores gerais',
    description:
      'Perfil COLABORADOR. Devolve a quantidade de associados (ativos e total), eventos, reservas e as mensalidades pagas e pendentes.',
  })
  @ApiResponse({ status: 200, description: 'Indicadores gerais' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de colaborador' })
  obterIndicadores() {
    return this.dashboardService.obterDashboard(Perfil.COLABORADOR);
  }

  @Get('/meu-resumo')
  @Perfis(Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resumo do associado',
    description:
      'Perfil ASSOCIADO. Devolve os próximos eventos confirmados, as próximas reservas, a mensalidade atual e o histórico de mensalidades do dono do token.',
  })
  @ApiResponse({ status: 200, description: 'Resumo do associado' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  obterMeuResumo(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.dashboardService.obterDashboard(
      Perfil.ASSOCIADO,
      usuario.associadoId ?? undefined,
    );
  }
}
