import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reserva, SituacaoReserva } from '../entities/reserva.entity';

import { Servico } from '../../servicos/entities/servico.entity';
import { Associado } from '../../../associado/entities/associado.entity';

import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Servico)
    private readonly servicoRepository: Repository<Servico>,

    @InjectRepository(Associado)
    private readonly associadoRepository: Repository<Associado>,
  ) {}

  async create(dto: CreateReservaDto, associadoId: number): Promise<Reserva> {
    const servico = await this.servicoRepository.findOne({
      where: { id: dto.servicoId },
    });

    if (!servico || !servico.ativo) {
      throw new NotFoundException('Serviço não encontrado ou indisponível.');
    }

    const associado = await this.associadoRepository.findOne({
      where: { id: associadoId },
    });

    if (!associado) {
      throw new NotFoundException('Associado não encontrado.');
    }

    const reserva = this.reservaRepository.create({
      servico,
      associado,
      dataReserva: dto.dataReserva,
      horario: dto.horario,
      observacao: dto.observacao,
      situacao: SituacaoReserva.PENDENTE,
    });

    return this.reservaRepository.save(reserva);
  }

  async findAll(associadoId?: number): Promise<Reserva[]> {
    const where = associadoId ? { associado: { id: associadoId } } : {};

    return this.reservaRepository.find({
      where,
      relations: {
        servico: true,
        associado: true,
      },
      order: {
        dataReserva: 'ASC',
        horario: 'ASC',
      },
    });
  }

  async findOne(id: number, associadoId?: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: {
        servico: true,
        associado: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (associadoId && reserva.associado.id !== associadoId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta reserva.',
      );
    }

    return reserva;
  }

  async update(
    id: number,
    dto: UpdateReservaDto,
    associadoId?: number,
  ): Promise<Reserva> {
    const reserva = await this.findOne(id, associadoId);

    if (reserva.situacao === SituacaoReserva.CANCELADA) {
      throw new BadRequestException(
        'Não é possível atualizar uma reserva cancelada.',
      );
    }

    if (dto.servicoId !== undefined) {
      const servico = await this.servicoRepository.findOne({
        where: { id: dto.servicoId },
      });

      if (!servico || !servico.ativo) {
        throw new NotFoundException('Serviço não encontrado ou indisponível.');
      }

      reserva.servico = servico;
    }

    if (dto.dataReserva !== undefined) {
      reserva.dataReserva = dto.dataReserva;
    }

    if (dto.horario !== undefined) {
      reserva.horario = dto.horario;
    }

    if (dto.observacao !== undefined) {
      reserva.observacao = dto.observacao;
    }

    return this.reservaRepository.save(reserva);
  }

  async cancelar(id: number, associadoId?: number): Promise<Reserva> {
    const reserva = await this.findOne(id, associadoId);

    if (reserva.situacao === SituacaoReserva.CANCELADA) {
      throw new BadRequestException('Esta reserva já está cancelada.');
    }

    reserva.situacao = SituacaoReserva.CANCELADA;

    return this.reservaRepository.save(reserva);
  }

  async confirmar(id: number): Promise<Reserva> {
    const reserva = await this.findOne(id);

    if (reserva.situacao === SituacaoReserva.CANCELADA) {
      throw new BadRequestException(
        'Não é possível confirmar uma reserva cancelada.',
      );
    }

    reserva.situacao = SituacaoReserva.CONFIRMADA;

    return this.reservaRepository.save(reserva);
  }
}
