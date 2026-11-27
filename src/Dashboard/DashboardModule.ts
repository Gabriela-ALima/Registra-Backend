import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Associado } from '../associado/entities/associado.entity';
import { Evento } from '../evento/entities/evento.entity';
import { InscricaoEvento } from '../inscricao-evento/entities/inscricao-evento.entity';
import { Reserva } from '../reservas/reservas/entities/reserva.entity';
import { Mensalidade } from '../financeiro/entities/mensalidade.entity';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Associado,
      Evento,
      InscricaoEvento,
      Reserva,
      Mensalidade,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
