import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAssociadoDto {
  @ApiProperty({
    description: 'Nome completo do associado',
    example: 'Maria Souza',
    maxLength: 150,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nomeCompleto: string;

  @ApiProperty({
    description:
      'CPF do associado, único no sistema. Aceita com ou sem pontuação e é salvo só com os 11 dígitos',
    example: '529.982.247-25',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Length(11, 11, { message: 'O CPF deve ter 11 dígitos' })
  cpf: string;

  @ApiProperty({
    description: 'E-mail do associado, também usado como login de acesso',
    example: 'maria.souza@email.com',
    maxLength: 150,
  })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiPropertyOptional({
    description: 'Telefone com DDD (opcional)',
    example: '51999990000',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({
    description: 'Data de nascimento no formato AAAA-MM-DD',
    example: '1990-05-20',
  })
  @IsDateString()
  dataNascimento: string;

  @ApiProperty({
    description: 'Endereço (rua e número)',
    example: 'Rua das Flores, 100',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  endereco: string;

  @ApiProperty({
    description: 'Cidade do associado',
    example: 'Charqueadas',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cidade: string;

  @ApiProperty({
    description:
      'Sigla do estado com 2 letras. Letras minúsculas são convertidas',
    example: 'RS',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^[A-Z]{2}$/, { message: 'O estado deve ser a sigla com 2 letras' })
  estado: string;

  @ApiProperty({
    description: 'Senha de acesso, de 8 a 72 caracteres, com letras e números',
    example: 'Senha123',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'A senha deve ter letras e números',
  })
  senha: string;
}
