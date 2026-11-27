import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Mensalidade } from './entities/mensalidade.entity';
import { Associado } from '../associado/entities/associado.entity';

import { MensalidadeService } from './services/mensalidade.service';
import { BoletoService } from './services/boleto.service';

import { MensalidadeController } from './controllers/mensalidade.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mensalidade, Associado])],
  controllers: [MensalidadeController],
  providers: [MensalidadeService, BoletoService],
  exports: [MensalidadeService, BoletoService],
})
export class MensalidadeModule {}
