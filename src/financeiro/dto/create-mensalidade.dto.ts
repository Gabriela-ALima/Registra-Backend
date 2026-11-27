import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMensalidadeDto {
  @IsInt()
  @Min(1, { message: 'Informe um associado válido.' })
  associadoId: number;

  @IsString()
  @IsNotEmpty({ message: 'O mês de referência é obrigatório.' })
  @Length(7, 7, {
    message: 'O mês de referência deve seguir o formato AAAA-MM.',
  })
  mesReferencia: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'O valor deve ser maior que zero.' })
  valor: number;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de vencimento é obrigatória.' })
  dataVencimento: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string | null;
}
