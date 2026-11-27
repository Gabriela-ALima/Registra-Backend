import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { UsuarioAtual } from '../../common/decorators/usuario-atual.decorator';
import { Perfil } from '../../common/enums/perfil.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfisGuard } from '../../common/guards/perfis.guard';
import { InscricaoEvento } from '../entities/inscricao-evento.entity';
import { InscricaoEventoService } from '../services/inscricao-evento.service';

@ApiTags('Confirmação de presença')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.ASSOCIADO)
@Controller()
export class InscricaoEventoController {
  constructor(
    private readonly inscricaoEventoService: InscricaoEventoService,
  ) {}

  @Post('/eventos/:id/presenca')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Confirmar presença em um evento',
    description:
      'Perfil ASSOCIADO. Confirma a presença do dono do token. Não permite confirmar duas vezes, respeita a capacidade máxima e só vale para eventos ATIVOS. Quem cancelou antes pode confirmar de novo.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Presença confirmada',
    type: InscricaoEvento,
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Presença já confirmada, evento lotado ou não ativo',
  })
  confirmar(
    @Param('id', ParseIntPipe) eventoId: number,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<InscricaoEvento> {
    return this.inscricaoEventoService.confirmar(
      eventoId,
      this.idDoAssociado(usuario),
    );
  }

  @Delete('/eventos/:id/presenca')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar a confirmação de presença',
    description:
      'Perfil ASSOCIADO. Cancela a confirmação do dono do token. O registro é mantido com a situação CANCELADA e a data do cancelamento.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Confirmação cancelada',
    type: InscricaoEvento,
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  @ApiResponse({
    status: 404,
    description: 'Sem presença confirmada neste evento',
  })
  cancelar(
    @Param('id', ParseIntPipe) eventoId: number,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<InscricaoEvento> {
    return this.inscricaoEventoService.cancelar(
      eventoId,
      this.idDoAssociado(usuario),
    );
  }

  @Get('/inscricoes/minhas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar os eventos em que confirmei presença',
    description:
      'Perfil ASSOCIADO. Devolve as presenças confirmadas do dono do token, com os dados do evento, em ordem cronológica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Presenças confirmadas',
    type: [InscricaoEvento],
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  listarMinhas(
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<InscricaoEvento[]> {
    return this.inscricaoEventoService.listarMinhas(
      this.idDoAssociado(usuario),
    );
  }

  @Get('/eventos/:id/participantes')
  @Perfis(Perfil.COLABORADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar os participantes confirmados de um evento',
    description:
      'Perfil COLABORADOR. Devolve os associados com presença confirmada no evento, em ordem alfabética.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Participantes confirmados',
    type: [InscricaoEvento],
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de colaborador' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  listarParticipantes(
    @Param('id', ParseIntPipe) eventoId: number,
  ): Promise<InscricaoEvento[]> {
    return this.inscricaoEventoService.listarParticipantes(eventoId);
  }

  private idDoAssociado(usuario: UsuarioAutenticado): number {
    if (usuario.associadoId === null) {
      throw new ForbiddenException('Conta sem cadastro de associado vinculado');
    }

    return usuario.associadoId;
  }
}
