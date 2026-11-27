import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Perfil } from '../common/enums/perfil.enum';
import { UsuarioService } from '../usuario/services/usuario.service';
import { LoginDto } from './dto/login.dto';

export interface PayloadJwt {
  sub: number;
  email: string;
  perfil: Perfil;
  associadoId: number | null;
}

export interface RespostaLogin {
  accessToken: string;
  usuario: {
    id: number;
    email: string;
    perfil: Perfil;
    associadoId: number | null;
  };
}

@Injectable()
export class AuthService {
  private readonly hashFicticio = bcrypt.hashSync('senha-ficticia', 10);

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<RespostaLogin> {
    const usuario = await this.usuarioService.buscarPorEmail(dto.email);

    const senhaConfere = await bcrypt.compare(
      dto.senha,
      usuario?.senhaCriptografada ?? this.hashFicticio,
    );

    if (!usuario || !senhaConfere || !usuario.ativo) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const associadoId = usuario.associado?.id ?? null;

    const payload: PayloadJwt = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      associadoId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        associadoId,
      },
    };
  }
}
