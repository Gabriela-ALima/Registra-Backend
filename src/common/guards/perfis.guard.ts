import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';
import { CHAVE_PERFIS } from '../decorators/perfis.decorator';
import { CHAVE_PUBLICO } from '../decorators/publico.decorator';
import { Perfil } from '../enums/perfil.enum';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const alvos = [context.getHandler(), context.getClass()];

    const publico = this.reflector.getAllAndOverride<boolean | undefined>(
      CHAVE_PUBLICO,
      alvos,
    );

    if (publico) {
      return true;
    }

    const perfisPermitidos = this.reflector.getAllAndOverride<
      Perfil[] | undefined
    >(CHAVE_PERFIS, alvos);

    if (!perfisPermitidos || perfisPermitidos.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();

    if (!user || !perfisPermitidos.includes(user.perfil)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
