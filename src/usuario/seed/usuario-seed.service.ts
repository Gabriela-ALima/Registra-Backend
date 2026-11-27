import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Associado } from '../../associado/entities/associado.entity';
import { Perfil } from '../../common/enums/perfil.enum';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuarioSeedService implements OnModuleInit {
  private readonly logger = new Logger(UsuarioSeedService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Associado)
    private readonly associadoRepository: Repository<Associado>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await this.criarColaborador();
    await this.criarAssociado();
  }

  private async criarColaborador(): Promise<void> {
    const email = 'colaborador@registra.com';

    if (await this.usuarioRepository.findOne({ where: { email } })) {
      return;
    }

    await this.usuarioRepository.save(
      this.usuarioRepository.create({
        email,
        senhaCriptografada: await bcrypt.hash('Colab@123', 10),
        perfil: Perfil.COLABORADOR,
      }),
    );

    this.logger.log(`Conta de teste criada: ${email}`);
  }

  private async criarAssociado(): Promise<void> {
    const email = 'associado@registra.com';

    if (await this.usuarioRepository.findOne({ where: { email } })) {
      return;
    }

    const cpf = '52998224725';

    let associado = await this.associadoRepository.findOne({ where: { cpf } });

    if (!associado) {
      associado = await this.associadoRepository.save(
        this.associadoRepository.create({
          nomeCompleto: 'Maria Souza',
          cpf,
          email,
          dataNascimento: '1990-05-20',
          endereco: 'Rua das Flores, 100',
          cidade: 'Charqueadas',
          estado: 'RS',
        }),
      );
    }

    await this.usuarioRepository.save(
      this.usuarioRepository.create({
        email,
        senhaCriptografada: await bcrypt.hash('Assoc@123', 10),
        perfil: Perfil.ASSOCIADO,
        associado,
      }),
    );

    this.logger.log(`Conta de teste criada: ${email}`);
  }
}
