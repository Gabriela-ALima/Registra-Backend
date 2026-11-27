import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociadoController } from './controllers/associado.controller';
import { Associado } from './entities/associado.entity';
import { AssociadoService } from './services/associado.service';
@Module({
  imports: [TypeOrmModule.forFeature([Associado])],
  providers: [AssociadoService],
  controllers: [AssociadoController],
  exports: [AssociadoService],
})
export class AssociadosModule {}
