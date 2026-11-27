import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { Publico } from '../../common/decorators/publico.decorator';
import { UsuarioAtual } from '../../common/decorators/usuario-atual.decorator';
import { Perfil } from '../../common/enums/perfil.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfisGuard } from '../../common/guards/perfis.guard';
import { CreateAssociadoDto } from '../dto/create-associado.dto';
import { UpdateAssociadoDto } from '../dto/update-associado.dto';
import { Associado } from '../entities/associado.entity';
import { AssociadoService } from '../services/associado.service';

@ApiTags('Associados')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.COLABORADOR)
@Controller('/associados')
export class AssociadoController {
  constructor(private readonly associadoService: AssociadoService) {}

  @Post()
  @Publico()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar-se como associado',
    description:
      'Rota pública. Cria o cadastro do associado e a sua conta de acesso (perfil ASSOCIADO). Depois, é só fazer o login em /auth/login. O cadastro só é considerado concluído depois do aceite do termo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Associado cadastrado',
    type: Associado,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail já cadastrado' })
  cadastrar(@Body() dto: CreateAssociadoDto): Promise<Associado> {
    return this.associadoService.cadastrar(dto);
  }

  @Get('/meu-cadastro')
  @Perfis(Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar o próprio cadastro',
    description:
      'Perfil ASSOCIADO. Devolve o cadastro do associado dono do token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cadastro do associado',
    type: Associado,
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  meuCadastro(@UsuarioAtual() usuario: UsuarioAutenticado): Promise<Associado> {
    return this.associadoService.buscarPorId(this.idDoAssociado(usuario));
  }

  @Patch('/meu-cadastro')
  @Perfis(Perfil.ASSOCIADO)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar o próprio cadastro',
    description:
      'Perfil ASSOCIADO. Atualiza apenas os campos enviados, sempre no cadastro do dono do token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cadastro atualizado',
    type: Associado,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Rota exclusiva de associado' })
  @ApiResponse({ status: 409, description: 'CPF já usado por outro associado' })
  atualizarMeuCadastro(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: UpdateAssociadoDto,
  ): Promise<Associado> {
    return this.associadoService.atualizar(this.idDoAssociado(usuario), dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar associados',
    description:
      'Perfil COLABORADOR. Devolve todos os associados em ordem alfabética pelo nome.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de associados',
    type: [Associado],
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  listar(): Promise<Associado[]> {
    return this.associadoService.listar();
  }

  @Get('/pesquisar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pesquisar por nome ou CPF',
    description:
      'Perfil COLABORADOR. Busca associados cujo nome ou CPF contenha o termo informado, sem diferenciar maiúsculas de minúsculas.',
  })
  @ApiQuery({
    name: 'termo',
    description: 'Parte do nome ou do CPF',
    example: 'maria',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Associados encontrados',
    type: [Associado],
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  pesquisar(@Query('termo') termo: string = ''): Promise<Associado[]> {
    return this.associadoService.pesquisar(termo);
  }

  @Get('/cpf/:cpf')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar associado por CPF',
    description:
      'Perfil COLABORADOR. Localiza um associado pelo CPF, com ou sem pontuação.',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do associado',
    example: '52998224725',
  })
  @ApiResponse({
    status: 200,
    description: 'Associado encontrado',
    type: Associado,
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  buscarPorCpf(@Param('cpf') cpf: string): Promise<Associado> {
    return this.associadoService.buscarPorCpf(cpf);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar associado por ID',
    description:
      'Perfil COLABORADOR. Localiza um associado pelo identificador.',
  })
  @ApiParam({ name: 'id', description: 'ID do associado', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Associado encontrado',
    type: Associado,
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<Associado> {
    return this.associadoService.buscarPorId(id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar cadastro de um associado',
    description:
      'Perfil COLABORADOR. Atualiza apenas os campos enviados. Os omitidos continuam como estão.',
  })
  @ApiParam({ name: 'id', description: 'ID do associado', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Associado atualizado',
    type: Associado,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  @ApiResponse({ status: 409, description: 'CPF já usado por outro associado' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociadoDto,
  ): Promise<Associado> {
    return this.associadoService.atualizar(id, dto);
  }

  @Patch('/:id/ativar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ativar associado',
    description: 'Perfil COLABORADOR. Muda a situação do associado para ATIVO.',
  })
  @ApiParam({ name: 'id', description: 'ID do associado', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Associado ativado',
    type: Associado,
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  ativar(@Param('id', ParseIntPipe) id: number): Promise<Associado> {
    return this.associadoService.ativar(id);
  }

  @Patch('/:id/desativar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desativar associado',
    description:
      'Perfil COLABORADOR. Muda a situação do associado para INATIVO.',
  })
  @ApiParam({ name: 'id', description: 'ID do associado', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Associado desativado',
    type: Associado,
  })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  desativar(@Param('id', ParseIntPipe) id: number): Promise<Associado> {
    return this.associadoService.desativar(id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir associado',
    description:
      'Perfil COLABORADOR. Remove o associado do sistema de forma definitiva.',
  })
  @ApiParam({ name: 'id', description: 'ID do associado', example: 1 })
  @ApiResponse({ status: 204, description: 'Associado excluído' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  remover(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.associadoService.remover(id);
  }

  private idDoAssociado(usuario: UsuarioAutenticado): number {
    if (usuario.associadoId === null) {
      throw new ForbiddenException('Conta sem cadastro de associado vinculado');
    }

    return usuario.associadoId;
  }
}
