import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Associado } from '../associado/entities/associado.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuarioSeedService } from './seed/usuario-seed.service';
import { UsuarioService } from './services/usuario.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Associado])],
  providers: [UsuarioService, UsuarioSeedService],
  controllers: [],
  exports: [UsuarioService],
})
export class UsuarioModule {}
