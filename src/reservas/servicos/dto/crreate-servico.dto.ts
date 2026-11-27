import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório.' })
  @MaxLength(150)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  local?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A capacidade deve ser pelo menos 1.' })
  capacidade?: number | null;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
