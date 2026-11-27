import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { UpdateEventoDto } from '../dto/update-evento.dto';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  criar(dto: CreateEventoDto): Promise<Evento> {
    const evento = this.eventoRepository.create(dto);
    return this.eventoRepository.save(evento);
  }

  listar(): Promise<Evento[]> {
    return this.eventoRepository.find({
      order: { data: 'ASC', horario: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Evento> {
    const evento = await this.eventoRepository.findOne({ where: { id } });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    return evento;
  }

  async atualizar(id: number, dto: UpdateEventoDto): Promise<Evento> {
    const evento = await this.buscarPorId(id);

    this.eventoRepository.merge(evento, dto);
    return this.eventoRepository.save(evento);
  }

  async remover(id: number): Promise<void> {
    const evento = await this.buscarPorId(id);
    await this.eventoRepository.remove(evento);
  }
}
