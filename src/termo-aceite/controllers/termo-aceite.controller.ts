import {
  Body,
  Controller,
  ForbiddenException,
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
import type { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { UsuarioAtual } from '../../common/decorators/usuario-atual.decorator';
import { Perfil } from '../../common/enums/perfil.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfisGuard } from '../../common/guards/perfis.guard';
import { AceitarTermoDto } from '../dto/aceitar-termo.dto';
import { TermoAceite } from '../entities/termo-aceite.entity';
import { Termo } from '../entities/termo.entity';
import { TermoAceiteService } from '../services/termo-aceite.service';

@ApiTags('Termo de aceite')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.ASSOCIADO)
@Controller('/termos')
export class TermoAceiteController {
  constructor(private readonly termoAceiteService: TermoAceiteService) {}

  @Get('/vigente')
  @Perfis(Perfil.ASSOCIADO, Perfil.COLABORADOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar o termo vigente',
    description:
      'Perfis ASSOCIADO e COLABORADOR. Devolve a versão e o texto do termo de aceite que está valendo, para o front-end apresentar.',
  })
  @ApiResponse({ status: 200, description: 'Termo vigente', type: Termo })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 404, description: 'Nenhum termo vigente' })
  buscarVigente(): Promise<Termo> {
    return this.termoAceiteService.buscarVigente();
  }

  @Post('/aceite')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aceitar o termo',
    description:
      'Perfil ASSOCIADO. Registra o aceite da versão informada, com data e hora, em nome do dono do token, e conclui o cadastro.',
  })
  @ApiResponse({
    status: 201,
    description: 'Aceite registrado',
    type: TermoAceite,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  @ApiResponse({
    status: 409,
    description: 'Termo já aceito ou versão diferente da vigente',
  })
  aceitar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: AceitarTermoDto,
  ): Promise<TermoAceite> {
    if (usuario.associadoId === null) {
      throw new ForbiddenException('Conta sem cadastro de associado vinculado');
    }

    return this.termoAceiteService.aceitar(usuario.associadoId, dto.versao);
  }
}
