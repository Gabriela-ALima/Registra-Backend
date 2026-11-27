import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ServicoService } from '../services/servico.service';
import { CreateServicoDto } from '../dto/crreate-servico.dto';
import { UpdateServicoDto } from '../dto/update-servico.dto';

@ApiTags('Serviços')
@Controller('servicos')
export class ServicoController {
  constructor(private readonly servicoService: ServicoService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo serviço' })
  create(@Body() dto: CreateServicoDto) {
    return this.servicoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os serviços cadastrados' })
  findAll() {
    return this.servicoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta os dados de um serviço pelo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um serviço' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicoDto) {
    return this.servicoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um serviço cadastrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicoService.remove(id);
  }
}
