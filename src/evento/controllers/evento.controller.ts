import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { Perfis } from '../../common/decorators/perfis.decorator';
import { Perfil } from '../../common/enums/perfil.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfisGuard } from '../../common/guards/perfis.guard';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { UpdateEventoDto } from '../dto/update-evento.dto';
import { Evento } from '../entities/evento.entity';
import { EventoService } from '../services/evento.service';

@ApiTags('Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.COLABORADOR)
@Controller('/eventos')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar evento',
    description:
      'Perfil COLABORADOR. Cria um evento com situação ATIVO. Sem capacidade máxima, o evento não tem limite de participantes.',
  })
  @ApiResponse({ status: 201, description: 'Evento criado', type: Evento })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  criar(@Body() dto: CreateEventoDto): Promise<Evento> {
    return this.eventoService.criar(dto);
  }

  @Get()
  @Perfis(Perfil.COLABORADOR, Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar eventos',
    description:
      'Perfis COLABORADOR e ASSOCIADO. Devolve os eventos em ordem cronológica, do mais próximo para o mais distante.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos',
    type: [Evento],
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  listar(): Promise<Evento[]> {
    return this.eventoService.listar();
  }

  @Get('/:id')
  @Perfis(Perfil.COLABORADOR, Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar evento por ID',
    description: 'Perfis COLABORADOR e ASSOCIADO. Localiza um evento.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({ status: 200, description: 'Evento encontrado', type: Evento })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<Evento> {
    return this.eventoService.buscarPorId(id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Editar evento',
    description:
      'Perfil COLABORADOR. Atualiza apenas os campos enviados. Também é por aqui que o evento é marcado como CANCELADO ou ENCERRADO.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({ status: 200, description: 'Evento atualizado', type: Evento })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventoDto,
  ): Promise<Evento> {
    return this.eventoService.atualizar(id, dto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir evento',
    description: 'Perfil COLABORADOR. Remove o evento de forma definitiva.',
  })
  @ApiParam({ name: 'id', description: 'ID do evento', example: 1 })
  @ApiResponse({ status: 204, description: 'Evento excluído' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  remover(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventoService.remover(id);
  }
}
