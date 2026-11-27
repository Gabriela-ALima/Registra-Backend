import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, ILike, Repository } from 'typeorm';
import { Perfil } from '../../common/enums/perfil.enum';
import { SituacaoAssociado } from '../../common/enums/situacao-associado.enum';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { CreateAssociadoDto } from '../dto/create-associado.dto';
import { UpdateAssociadoDto } from '../dto/update-associado.dto';
import { Associado } from '../entities/associado.entity';

@Injectable()
export class AssociadoService {
  constructor(
    @InjectRepository(Associado)
    private readonly associadoRepository: Repository<Associado>,
    private readonly dataSource: DataSource,
  ) {}

  async cadastrar(dto: CreateAssociadoDto): Promise<Associado> {
    const { senha, ...dadosAssociado } = dto;
    const email = dto.email.trim().toLowerCase();
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const cpfExiste = await manager.count(Associado, {
          where: { cpf: dadosAssociado.cpf },
        });
        const emailExiste = await manager.count(Usuario, { where: { email } });

        if (cpfExiste > 0 || emailExiste > 0) {
          throw new ConflictException('CPF ou e-mail já cadastrado');
        }

        const associado = await manager.save(
          manager.create(Associado, { ...dadosAssociado, email }),
        );

        await manager.save(
          manager.create(Usuario, {
            email,
            senhaCriptografada,
            perfil: Perfil.ASSOCIADO,
            associado,
          }),
        );

        return associado;
      });
    } catch (erro) {
      if ((erro as { code?: string }).code === '23505') {
        throw new ConflictException('CPF ou e-mail já cadastrado');
      }

      throw erro;
    }
  }

  listar(): Promise<Associado[]> {
    return this.associadoRepository.find({ order: { nomeCompleto: 'ASC' } });
  }

  async buscarPorId(id: number): Promise<Associado> {
    const associado = await this.associadoRepository.findOne({ where: { id } });

    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }

    return associado;
  }

  async buscarPorCpf(cpf: string): Promise<Associado> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const associado = await this.associadoRepository.findOne({
      where: { cpf: cpfLimpo },
    });

    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }

    return associado;
  }

  async pesquisar(termo: string): Promise<Associado[]> {
    const texto = termo.trim().replace(/[%_\\]/g, '\\$&');
    const cpfParcial = termo.replace(/\D/g, '');

    const filtros: { nomeCompleto?: any; cpf?: any }[] = [
      { nomeCompleto: ILike(`%${texto}%`) },
    ];

    if (cpfParcial) {
      filtros.push({ cpf: ILike(`%${cpfParcial}%`) });
    }

    return this.associadoRepository.find({
      where: filtros,
      order: { nomeCompleto: 'ASC' },
    });
  }

  async atualizar(id: number, dto: UpdateAssociadoDto): Promise<Associado> {
    const associado = await this.buscarPorId(id);

    if (dto.cpf && dto.cpf !== associado.cpf) {
      await this.validarCpfUnico(dto.cpf, id);
    }

    this.associadoRepository.merge(associado, dto);
    return this.associadoRepository.save(associado);
  }

  async remover(id: number): Promise<void> {
    const associado = await this.buscarPorId(id);
    await this.associadoRepository.remove(associado);
  }

  ativar(id: number): Promise<Associado> {
    return this.alterarSituacao(id, SituacaoAssociado.ATIVO);
  }

  desativar(id: number): Promise<Associado> {
    return this.alterarSituacao(id, SituacaoAssociado.INATIVO);
  }

  private async alterarSituacao(
    id: number,
    situacao: SituacaoAssociado,
  ): Promise<Associado> {
    const associado = await this.buscarPorId(id);
    associado.situacao = situacao;
    return this.associadoRepository.save(associado);
  }

  private async validarCpfUnico(cpf: string, ignorarId?: number) {
    const existente = await this.associadoRepository.findOne({
      where: { cpf },
    });

    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe um associado com este CPF');
    }
  }
}
