import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Servico } from '../entities/servico.entity';
import { CreateServicoDto } from '../dto/crreate-servico.dto';
import { UpdateServicoDto } from '../dto/update-servico.dto';

@Injectable()
export class ServicoService {
  constructor(
    @InjectRepository(Servico)
    private readonly servicoRepository: Repository<Servico>,
  ) {}

  async create(dto: CreateServicoDto): Promise<Servico> {
    const servico = this.servicoRepository.create(dto);

    return this.servicoRepository.save(servico);
  }

  async findAll(): Promise<Servico[]> {
    return this.servicoRepository.find({
      order: {
        nome: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Servico> {
    const servico = await this.servicoRepository.findOne({
      where: { id },
    });

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado.`);
    }

    return servico;
  }

  async update(id: number, dto: UpdateServicoDto): Promise<Servico> {
    const servico = await this.findOne(id);

    Object.assign(servico, dto);

    return this.servicoRepository.save(servico);
  }

  async remove(id: number): Promise<void> {
    const servico = await this.findOne(id);

    await this.servicoRepository.remove(servico);
  }
}
