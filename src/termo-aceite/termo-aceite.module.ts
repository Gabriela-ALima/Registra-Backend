import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermoAceite } from './entities/termo-aceite.entity';
import { Termo } from './entities/termo.entity';
import { TermoSeedService } from './seed/termo-seed.service';
import { TermoAceiteController } from './controllers/termo-aceite.controller';
import { TermoAceiteService } from './services/termo-aceite.service';

@Module({
  imports: [TypeOrmModule.forFeature([Termo, TermoAceite])],
  providers: [TermoAceiteService, TermoSeedService],
  controllers: [TermoAceiteController],
  exports: [TermoAceiteService],
})
export class TermoAceiteModule {}
