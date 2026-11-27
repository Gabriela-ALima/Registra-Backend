import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Termo } from '../entities/termo.entity';

const CONTEUDO_TERMO_V1 = `TERMO DE ACEITE E CONDIÇÕES DE ASSOCIAÇÃO

1. Do objeto
Este termo estabelece as condições para a associação ao Registra+ e para o uso do sistema de gestão da associação.

2. Dos dados cadastrais
O associado declara que as informações fornecidas no cadastro são verdadeiras e se compromete a mantê-las atualizadas.

3. Da mensalidade
O associado concorda em pagar a mensalidade padrão definida pela associação, com vencimento mensal, conforme as cobranças geradas no sistema.

4. Dos eventos e dos espaços
O associado poderá confirmar presença em eventos e reservar os espaços e serviços disponíveis, respeitando a capacidade e os horários definidos pela associação.

5. Do tratamento dos dados pessoais
Os dados pessoais do associado serão utilizados apenas para a gestão da associação, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), e não serão compartilhados com terceiros sem autorização.

6. Da desativação
A associação poderá desativar o cadastro do associado em caso de descumprimento das condições deste termo.

7. Do aceite
Ao aceitar este termo, o associado declara que leu e concorda com todas as condições acima.`;

@Injectable()
export class TermoSeedService implements OnModuleInit {
  private readonly logger = new Logger(TermoSeedService.name);

  constructor(
    @InjectRepository(Termo)
    private readonly termoRepository: Repository<Termo>,
  ) {}

  async onModuleInit(): Promise<void> {
    const total = await this.termoRepository.count();

    if (total > 0) {
      return;
    }

    await this.termoRepository.save(
      this.termoRepository.create({
        versao: '1.0',
        conteudo: CONTEUDO_TERMO_V1,
        vigente: true,
      }),
    );

    this.logger.log('Termo de aceite versão 1.0 criado');
  }
}
