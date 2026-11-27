import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Associado } from './associado/entities/associado.entity';
import { AssociadosModule } from './associado/associado.module';

import { AuthModule } from './auth/auth.module';

import { Usuario } from './usuario/entities/usuario.entity';
import { UsuarioModule } from './usuario/usuario.module';

import { TermoAceite } from './termo-aceite/entities/termo-aceite.entity';
import { Termo } from './termo-aceite/entities/termo.entity';
import { TermoAceiteModule } from './termo-aceite/termo-aceite.module';

import { Evento } from './evento/entities/evento.entity';
import { EventoModule } from './evento/evento.module';

import { InscricaoEvento } from './inscricao-evento/entities/inscricao-evento.entity';
import { InscricaoEventoModule } from './inscricao-evento/inscricao-evento.module';

import { Servico } from './reservas/servicos/entities/servico.entity';
import { ServicoModule } from './reservas/servicos/servico.module';

import { Reserva } from './reservas/reservas/entities/reserva.entity';
import { ReservaModule } from './reservas/reservas/reservas.module';

import { Mensalidade } from './financeiro/entities/mensalidade.entity';
import { MensalidadeModule } from './financeiro/mensalidade.module';

import { DashboardModule } from './Dashboard/DashboardModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Associado,
        Usuario,
        Termo,
        TermoAceite,
        Evento,
        InscricaoEvento,
        Servico,
        Reserva,
        Mensalidade,
      ],
      synchronize: true,
    }),

    AssociadosModule,
    UsuarioModule,
    AuthModule,
    TermoAceiteModule,
    EventoModule,
    InscricaoEventoModule,
    ServicoModule,
    ReservaModule,
    MensalidadeModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
