import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail da conta de acesso',
    example: 'colaborador@registra.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha da conta',
    example: 'Colab@123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  senha: string;
}
