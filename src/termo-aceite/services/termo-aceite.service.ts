import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Associado } from '../../associado/entities/associado.entity';
import { TermoAceite } from '../entities/termo-aceite.entity';
import { Termo } from '../entities/termo.entity';

@Injectable()
export class TermoAceiteService {
  constructor(
    @InjectRepository(Termo)
    private readonly termoRepository: Repository<Termo>,
    private readonly dataSource: DataSource,
  ) {}

  async buscarVigente(): Promise<Termo> {
    const termo = await this.termoRepository.findOne({
      where: { vigente: true },
    });

    if (!termo) {
      throw new NotFoundException('Nenhum termo vigente');
    }

    return termo;
  }

  async aceitar(associadoId: number, versao: string): Promise<TermoAceite> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const termo = await manager.findOne(Termo, {
          where: { vigente: true },
        });

        if (!termo) {
          throw new NotFoundException('Nenhum termo vigente');
        }

        if (termo.versao !== versao) {
          throw new ConflictException(
            `A versão vigente do termo é a ${termo.versao}. Leia o termo atual antes de aceitar`,
          );
        }

        const associado = await manager.findOne(Associado, {
          where: { id: associadoId },
        });

        if (!associado) {
          throw new NotFoundException('Associado não encontrado');
        }

        const jaAceitou = await manager.count(TermoAceite, {
          where: { associado: { id: associadoId }, termo: { id: termo.id } },
        });

        if (jaAceitou > 0) {
          throw new ConflictException('Termo já aceito');
        }

        const aceite = await manager.save(
          manager.create(TermoAceite, { associado, termo }),
        );

        associado.cadastroConcluido = true;
        await manager.save(associado);

        return aceite;
      });
    } catch (erro) {
      if ((erro as { code?: string }).code === '23505') {
        throw new ConflictException('Termo já aceito');
      }

      throw erro;
    }
  }
}
