import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from '../evento/entities/evento.entity';
import { InscricaoEventoController } from './controllers/inscricao-evento.controller';
import { InscricaoEvento } from './entities/inscricao-evento.entity';
import { InscricaoEventoService } from './services/inscricao-evento.service';

@Module({
  imports: [TypeOrmModule.forFeature([InscricaoEvento, Evento])],
  providers: [InscricaoEventoService],
  controllers: [InscricaoEventoController],
  exports: [InscricaoEventoService],
})
export class InscricaoEventoModule {}
