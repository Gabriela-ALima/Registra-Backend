import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Perfil } from '../../common/enums/perfil.enum';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { PayloadJwt } from '../auth.service';

export interface UsuarioAutenticado {
  id: number;
  email: string;
  perfil: Perfil;
  associadoId: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuarioService: UsuarioService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadJwt): Promise<UsuarioAutenticado> {
    const usuario = await this.usuarioService.buscarPorId(payload.sub);

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Conta inativa ou inexistente');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      associadoId: usuario.associado?.id ?? null,
    };
  }
}
