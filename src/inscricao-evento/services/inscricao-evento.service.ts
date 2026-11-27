import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SituacaoEvento } from '../../common/enums/situacao-evento.enum';
import { SituacaoInscricao } from '../../common/enums/situacao-inscricao.enum';
import { Evento } from '../../evento/entities/evento.entity';
import { InscricaoEvento } from '../entities/inscricao-evento.entity';

@Injectable()
export class InscricaoEventoService {
  constructor(
    @InjectRepository(InscricaoEvento)
    private readonly inscricaoRepository: Repository<InscricaoEvento>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    private readonly dataSource: DataSource,
  ) {}

  async confirmar(
    eventoId: number,
    associadoId: number,
  ): Promise<InscricaoEvento> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const evento = await manager.findOne(Evento, {
          where: { id: eventoId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!evento) {
          throw new NotFoundException('Evento não encontrado');
        }

        if (evento.situacao !== SituacaoEvento.ATIVO) {
          throw new ConflictException(
            'Este evento não está aberto para confirmações',
          );
        }

        const existente = await manager.findOne(InscricaoEvento, {
          where: {
            evento: { id: eventoId },
            associado: { id: associadoId },
          },
        });

        if (existente?.situacao === SituacaoInscricao.CONFIRMADA) {
          throw new ConflictException('Presença já confirmada neste evento');
        }

        if (evento.capacidadeMaxima !== null) {
          const confirmadas = await manager.count(InscricaoEvento, {
            where: {
              evento: { id: eventoId },
              situacao: SituacaoInscricao.CONFIRMADA,
            },
          });

          if (confirmadas >= evento.capacidadeMaxima) {
            throw new ConflictException('Evento lotado');
          }
        }

        if (existente) {
          existente.situacao = SituacaoInscricao.CONFIRMADA;
          existente.confirmadaEm = new Date();
          existente.canceladaEm = null;
          return manager.save(existente);
        }

        return manager.save(
          manager.create(InscricaoEvento, {
            evento,
            associado: { id: associadoId },
          }),
        );
      });
    } catch (erro) {
      if ((erro as { code?: string }).code === '23505') {
        throw new ConflictException('Presença já confirmada neste evento');
      }

      throw erro;
    }
  }

  async cancelar(
    eventoId: number,
    associadoId: number,
  ): Promise<InscricaoEvento> {
    const inscricao = await this.inscricaoRepository.findOne({
      where: {
        evento: { id: eventoId },
        associado: { id: associadoId },
        situacao: SituacaoInscricao.CONFIRMADA,
      },
    });

    if (!inscricao) {
      throw new NotFoundException(
        'Você não tem presença confirmada neste evento',
      );
    }

    inscricao.situacao = SituacaoInscricao.CANCELADA;
    inscricao.canceladaEm = new Date();
    return this.inscricaoRepository.save(inscricao);
  }

  listarMinhas(associadoId: number): Promise<InscricaoEvento[]> {
    return this.inscricaoRepository.find({
      where: {
        associado: { id: associadoId },
        situacao: SituacaoInscricao.CONFIRMADA,
      },
      relations: { evento: true },
      order: { evento: { data: 'ASC', horario: 'ASC' } },
    });
  }

  async listarParticipantes(eventoId: number): Promise<InscricaoEvento[]> {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    return this.inscricaoRepository.find({
      where: {
        evento: { id: eventoId },
        situacao: SituacaoInscricao.CONFIRMADA,
      },
      relations: { associado: true },
      order: { associado: { nomeCompleto: 'ASC' } },
    });
  }
}
