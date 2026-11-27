import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventoDto {
  @ApiProperty({
    description: 'Título do evento',
    example: 'Assembleia geral',
    maxLength: 150,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descrição do evento (opcional)',
    example: 'Prestação de contas e eleição da nova diretoria',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({
    description: 'Data do evento no formato AAAA-MM-DD',
    example: '2026-12-20',
  })
  @IsDateString()
  data: string;

  @ApiProperty({
    description: 'Horário do evento no formato HH:mm',
    example: '19:30',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'O horário deve estar no formato HH:mm',
  })
  horario: string;

  @ApiProperty({
    description: 'Local onde o evento acontece',
    example: 'Salão principal da sede',
    maxLength: 150,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  local: string;

  @ApiPropertyOptional({
    description:
      'Número máximo de participantes. Se omitido, o evento não tem limite',
    example: 80,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidadeMaxima?: number;
}
