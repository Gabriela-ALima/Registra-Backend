import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SituacaoEvento } from '../../common/enums/situacao-evento.enum';
import { CreateEventoDto } from './create-evento.dto';

export class UpdateEventoDto extends PartialType(CreateEventoDto) {
  @ApiPropertyOptional({
    description: 'Situação do evento',
    enum: SituacaoEvento,
    example: SituacaoEvento.CANCELADO,
  })
  @IsOptional()
  @IsEnum(SituacaoEvento)
  situacao?: SituacaoEvento;
}
