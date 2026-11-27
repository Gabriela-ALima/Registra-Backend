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
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { MensalidadeService } from '../services/mensalidade.service';
import { BoletoService } from '../services/boleto.service';

import { CreateMensalidadeDto } from '../dto/create-mensalidade.dto';
import { UpdateMensalidadeDto } from '../dto/UpdateMensalidadeDto';

import { Perfil } from '../../common/enums/perfil.enum';
import { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';

interface RequestAutenticado extends Request {
  user: UsuarioAutenticado;
}

@ApiTags('Financeiro')
@ApiBearerAuth()
@Controller('mensalidades')
@UseGuards(AuthGuard('jwt'))
export class MensalidadeController {
  constructor(
    private readonly mensalidadeService: MensalidadeService,
    private readonly boletoService: BoletoService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastra uma mensalidade para um associado',
  })
  create(@Body() dto: CreateMensalidadeDto, @Req() req: RequestAutenticado) {
    if (req.user.perfil !== Perfil.COLABORADOR) {
      throw new ForbiddenException(
        'Somente colaboradores podem cadastrar mensalidades.',
      );
    }

    return this.mensalidadeService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista as mensalidades conforme o perfil do usuário',
  })
  findAll(@Req() req: RequestAutenticado) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.mensalidadeService.findAll();
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.mensalidadeService.findAll(usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  @Get(':id/boleto')
  @ApiOperation({
    summary: 'Gera e baixa o boleto demonstrativo em PDF',
  })
  async gerarBoleto(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
    @Res() res: Response,
  ) {
    const usuario = req.user;

    if (
      usuario.perfil !== Perfil.COLABORADOR &&
      usuario.perfil !== Perfil.ASSOCIADO
    ) {
      throw new ForbiddenException('Perfil sem permissão.');
    }

    const associadoId =
      usuario.perfil === Perfil.ASSOCIADO
        ? (usuario.associadoId ?? undefined)
        : undefined;

    if (usuario.perfil === Perfil.ASSOCIADO && associadoId === undefined) {
      throw new ForbiddenException('Associado não identificado.');
    }

    const pdf = await this.boletoService.gerarBoleto(id, associadoId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="mensalidade-${id}.pdf"`,
      'Content-Length': pdf.length,
    });

    return res.end(pdf);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta uma mensalidade pelo ID',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    const usuario = req.user;

    if (usuario.perfil === Perfil.COLABORADOR) {
      return this.mensalidadeService.findOne(id);
    }

    if (usuario.perfil === Perfil.ASSOCIADO && usuario.associadoId) {
      return this.mensalidadeService.findOne(id, usuario.associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza os dados de uma mensalidade',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMensalidadeDto,
    @Req() req: RequestAutenticado,
  ) {
    if (req.user.perfil !== Perfil.COLABORADOR) {
      throw new ForbiddenException(
        'Somente colaboradores podem atualizar mensalidades.',
      );
    }

    return this.mensalidadeService.update(id, dto);
  }

  @Patch(':id/pagar')
  @ApiOperation({
    summary: 'Registra o pagamento de uma mensalidade',
  })
  registrarPagamento(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    if (req.user.perfil !== Perfil.COLABORADOR) {
      throw new ForbiddenException(
        'Somente colaboradores podem registrar pagamentos.',
      );
    }

    return this.mensalidadeService.registrarPagamento(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui uma mensalidade não paga',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    if (req.user.perfil !== Perfil.COLABORADOR) {
      throw new ForbiddenException(
        'Somente colaboradores podem excluir mensalidades.',
      );
    }

    return this.mensalidadeService.remove(id);
  }
}
