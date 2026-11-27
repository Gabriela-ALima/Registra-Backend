import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoController } from './controllers/evento.controller';
import { Evento } from './entities/evento.entity';
import { EventoService } from './services/evento.service';

@Module({
  imports: [TypeOrmModule.forFeature([Evento])],
  providers: [EventoService],
  controllers: [EventoController],
  exports: [EventoService],
})
export class EventoModule {}
