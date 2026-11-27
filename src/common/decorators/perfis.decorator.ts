import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../enums/perfil.enum';

export const CHAVE_PERFIS = 'perfis';

export const Perfis = (...perfis: Perfil[]) =>
  SetMetadata(CHAVE_PERFIS, perfis);
