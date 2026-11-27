import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import {
  Mensalidade,
  SituacaoMensalidade,
} from '../entities/mensalidade.entity';

import { Associado } from '../../associado/entities/associado.entity';

import { CreateMensalidadeDto } from '../dto/create-mensalidade.dto';
import { UpdateMensalidadeDto } from '../dto/UpdateMensalidadeDto';

@Injectable()
export class MensalidadeService {
  constructor(
    @InjectRepository(Mensalidade)
    private readonly mensalidadeRepository: Repository<Mensalidade>,

    @InjectRepository(Associado)
    private readonly associadoRepository: Repository<Associado>,
  ) {}

  async create(dto: CreateMensalidadeDto): Promise<Mensalidade> {
    const associado = await this.associadoRepository.findOne({
      where: { id: dto.associadoId },
    });

    if (!associado) {
      throw new NotFoundException('Associado não encontrado.');
    }

    const mensalidadeExistente = await this.mensalidadeRepository.findOne({
      where: {
        associado: { id: dto.associadoId },
        mesReferencia: dto.mesReferencia,
      },
    });

    if (mensalidadeExistente) {
      throw new ConflictException(
        'Já existe uma mensalidade para este associado neste mês.',
      );
    }

    const mensalidade = this.mensalidadeRepository.create({
      associado,
      mesReferencia: dto.mesReferencia,
      valor: dto.valor,
      dataVencimento: dto.dataVencimento,
      observacao: dto.observacao,
      situacao: SituacaoMensalidade.PENDENTE,
    });

    return this.mensalidadeRepository.save(mensalidade);
  }

  private async atualizarVencidas(): Promise<void> {
    const hoje = new Date().toISOString().slice(0, 10);

    await this.mensalidadeRepository.update(
      {
        situacao: SituacaoMensalidade.PENDENTE,
        dataVencimento: LessThan(hoje),
      },
      {
        situacao: SituacaoMensalidade.VENCIDA,
      },
    );
  }

  async findAll(associadoId?: number): Promise<Mensalidade[]> {
    await this.atualizarVencidas();

    const where =
      associadoId !== undefined ? { associado: { id: associadoId } } : {};

    return this.mensalidadeRepository.find({
      where,
      relations: { associado: true },
      order: {
        dataVencimento: 'DESC',
      },
    });
  }

  async findOne(id: number, associadoId?: number): Promise<Mensalidade> {
    await this.atualizarVencidas();

    const mensalidade = await this.mensalidadeRepository.findOne({
      where: { id },
      relations: { associado: true },
    });

    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada.');
    }

    if (associadoId !== undefined && mensalidade.associado.id !== associadoId) {
      throw new NotFoundException('Mensalidade não encontrada.');
    }

    return mensalidade;
  }

  async update(id: number, dto: UpdateMensalidadeDto): Promise<Mensalidade> {
    const mensalidade = await this.findOne(id);

    if (mensalidade.situacao === SituacaoMensalidade.PAGA) {
      throw new BadRequestException(
        'Não é possível alterar uma mensalidade já paga.',
      );
    }

    if (dto.associadoId !== undefined) {
      const associado = await this.associadoRepository.findOne({
        where: { id: dto.associadoId },
      });

      if (!associado) {
        throw new NotFoundException('Associado não encontrado.');
      }

      mensalidade.associado = associado;
    }

    if (dto.mesReferencia !== undefined) {
      mensalidade.mesReferencia = dto.mesReferencia;
    }

    if (dto.valor !== undefined) {
      mensalidade.valor = dto.valor;
    }

    if (dto.dataVencimento !== undefined) {
      mensalidade.dataVencimento = dto.dataVencimento;
    }

    if (dto.observacao !== undefined) {
      mensalidade.observacao = dto.observacao;
    }

    const hoje = new Date().toISOString().slice(0, 10);

    mensalidade.situacao =
      mensalidade.dataVencimento < hoje
        ? SituacaoMensalidade.VENCIDA
        : SituacaoMensalidade.PENDENTE;

    return this.mensalidadeRepository.save(mensalidade);
  }

  async registrarPagamento(id: number): Promise<Mensalidade> {
    const mensalidade = await this.findOne(id);

    if (mensalidade.situacao === SituacaoMensalidade.PAGA) {
      throw new BadRequestException('Esta mensalidade já foi paga.');
    }

    mensalidade.situacao = SituacaoMensalidade.PAGA;
    mensalidade.dataPagamento = new Date().toISOString().slice(0, 10);

    return this.mensalidadeRepository.save(mensalidade);
  }

  async remove(id: number): Promise<void> {
    const mensalidade = await this.findOne(id);

    if (mensalidade.situacao === SituacaoMensalidade.PAGA) {
      throw new BadRequestException(
        'Não é possível excluir uma mensalidade já paga.',
      );
    }

    await this.mensalidadeRepository.remove(mensalidade);
  }
}
