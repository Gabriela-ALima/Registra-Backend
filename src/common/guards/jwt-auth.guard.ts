import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CHAVE_PUBLICO } from '../decorators/publico.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const publico = this.reflector.getAllAndOverride<boolean | undefined>(
      CHAVE_PUBLICO,
      [context.getHandler(), context.getClass()],
    );

    if (publico) {
      return true;
    }

    return super.canActivate(context);
  }
}
