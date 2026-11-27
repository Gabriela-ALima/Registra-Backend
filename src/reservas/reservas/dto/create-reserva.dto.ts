import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  @Min(1, { message: 'Informe um serviço válido.' })
  servicoId: number;

  @IsDateString()
  @IsNotEmpty({ message: 'A data da reserva é obrigatória.' })
  dataReserva: string;

  @IsString()
  @IsNotEmpty({ message: 'O horário da reserva é obrigatório.' })
  horario: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string | null;
}
