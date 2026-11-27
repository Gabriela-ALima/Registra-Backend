import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reserva } from './entities/reserva.entity';
import { Servico } from '../servicos/entities/servico.entity';
import { Associado } from '../../associado/entities/associado.entity';

import { ReservaService } from './services/reserva.service';
import { ReservaController } from './controllers/reserva.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Servico, Associado])],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService],
})
export class ReservaModule {}
