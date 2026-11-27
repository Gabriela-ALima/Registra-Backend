import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReservaService } from '../services/reserva.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';
import { Perfil } from '../../../common/enums/perfil.enum';
import { UsuarioAutenticado } from '../../../auth/strategies/jwt.strategy';

interface RequestAutenticado extends Request {
  user: UsuarioAutenticado;
}

@ApiTags('Reservas')
@Controller('reservas')
@UseGuards(AuthGuard('jwt'))
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @ApiOperation({ summary: 'Solicita uma reserva de serviço' })
  create(@Body() dto: CreateReservaDto, @Req() req: RequestAutenticado) {
    const usuario = req.user;

    if (usuario.perfil !== Perfil.ASSOCIADO || !usuario.associadoId) {
      throw new ForbiddenException(
        'Somente associados podem solicitar reservas.',
      );
    }

    return this.reservaService.create(dto, usuario.associadoId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as reservas conforme o perfil do usuário' })
  findAll(@Req() req: RequestAutenticado) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.reservaService.findAll();
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.reservaService.findAll(usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta os detalhes de uma reserva pelo ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.reservaService.findOne(id);
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.reservaService.findOne(id, usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma reserva' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservaDto,
    @Req() req: RequestAutenticado,
  ) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.reservaService.update(id, dto);
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.reservaService.update(id, dto, usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirma uma reserva (somente colaborador)' })
  confirmar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    if (req.user.perfil !== Perfil.COLABORADOR) {
      throw new ForbiddenException(
        'Somente colaboradores podem confirmar reservas.',
      );
    }

    return this.reservaService.confirmar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancela uma reserva' })
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.reservaService.cancelar(id);
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.reservaService.cancelar(id, usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }
}
