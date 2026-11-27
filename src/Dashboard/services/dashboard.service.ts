import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { Associado } from '../../associado/entities/associado.entity';
import { Perfil } from '../../common/enums/perfil.enum';
import { SituacaoAssociado } from '../../common/enums/situacao-associado.enum';
import { SituacaoEvento } from '../../common/enums/situacao-evento.enum';
import { SituacaoInscricao } from '../../common/enums/situacao-inscricao.enum';
import { Evento } from '../../evento/entities/evento.entity';
import {
  Mensalidade,
  SituacaoMensalidade,
} from '../../financeiro/entities/mensalidade.entity';
import { InscricaoEvento } from '../../inscricao-evento/entities/inscricao-evento.entity';
import { Reserva } from '../../reservas/reservas/entities/reserva.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Associado)
    private readonly associadoRepository: Repository<Associado>,

    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,

    @InjectRepository(InscricaoEvento)
    private readonly inscricaoRepository: Repository<InscricaoEvento>,

    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Mensalidade)
    private readonly mensalidadeRepository: Repository<Mensalidade>,
  ) {}

  async obterDashboard(perfil: Perfil, associadoId?: number) {
    if (perfil === Perfil.COLABORADOR) {
      return this.obterDashboardColaborador();
    }

    if (perfil === Perfil.ASSOCIADO && associadoId) {
      return this.obterDashboardAssociado(associadoId);
    }

    throw new ForbiddenException('Perfil sem permissão.');
  }

  private async obterDashboardColaborador() {
    const [
      totalAssociados,
      totalEventos,
      totalInscricoes,
      totalReservas,
      mensalidades,
      totalAtivos,
    ] = await Promise.all([
      this.associadoRepository.count(),
      this.eventoRepository.count(),
      this.inscricaoRepository.count(),
      this.reservaRepository.count(),
      this.mensalidadeRepository.find(),
      this.associadoRepository.count({
        where: { situacao: SituacaoAssociado.ATIVO },
      }),
    ]);

    return {
      perfil: 'COLABORADOR',
      associados: {
        total: totalAssociados,
        ativos: totalAtivos,
        inativos: totalAssociados - totalAtivos,
      },
      eventos: {
        total: totalEventos,
        totalInscricoes,
      },
      reservas: {
        total: totalReservas,
      },
      financeiro: {
        totalMensalidades: mensalidades.length,
        pagas: mensalidades.filter(
          (item) => item.situacao === SituacaoMensalidade.PAGA,
        ).length,
        pendentes: mensalidades.filter(
          (item) => item.situacao === SituacaoMensalidade.PENDENTE,
        ).length,
        vencidas: mensalidades.filter(
          (item) => item.situacao === SituacaoMensalidade.VENCIDA,
        ).length,
        valorTotal: mensalidades.reduce(
          (total, item) => total + Number(item.valor),
          0,
        ),
      },
    };
  }

  private async obterDashboardAssociado(associadoId: number) {
    const hoje = this.dataDeHoje();

    const [associado, proximasInscricoes, proximasReservas, mensalidades] =
      await Promise.all([
        this.associadoRepository.findOne({
          where: { id: associadoId },
        }),
        this.inscricaoRepository.find({
          where: {
            associado: { id: associadoId },
            situacao: SituacaoInscricao.CONFIRMADA,
            evento: {
              data: MoreThanOrEqual(hoje),
              situacao: SituacaoEvento.ATIVO,
            },
          },
          relations: { evento: true },
          order: { evento: { data: 'ASC', horario: 'ASC' } },
        }),
        this.reservaRepository.find({
          where: {
            associado: { id: associadoId },
            dataReserva: MoreThanOrEqual(hoje),
          },
          relations: { servico: true },
          order: { dataReserva: 'ASC' },
        }),
        this.mensalidadeRepository.find({
          where: { associado: { id: associadoId } },
          order: { dataVencimento: 'DESC' },
        }),
      ]);

    if (!associado) {
      throw new ForbiddenException('Associado não encontrado.');
    }

    const emAberto = mensalidades.filter(
      (item) => item.situacao !== SituacaoMensalidade.PAGA,
    );
    const mensalidadeAtual =
      emAberto[emAberto.length - 1] ?? mensalidades[0] ?? null;

    return {
      perfil: 'ASSOCIADO',
      associado: {
        id: associado.id,
        nomeCompleto: associado.nomeCompleto,
        situacao: associado.situacao,
        cadastroConcluido: associado.cadastroConcluido,
      },
      proximosEventos: proximasInscricoes.map((inscricao) => ({
        confirmadaEm: inscricao.confirmadaEm,
        evento: inscricao.evento,
      })),
      proximasReservas,
      mensalidadeAtual,
      historicoMensalidades: mensalidades,
    };
  }

  private dataDeHoje(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${agora.getFullYear()}-${mes}-${dia}`;
  }
}
