import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../../auth/strategies/jwt.strategy';

export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, context: ExecutionContext): UsuarioAutenticado => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: UsuarioAutenticado }>();

    return request.user;
  },
);
