import { PartialType } from '@nestjs/mapped-types';
import { CreateServicoDto } from './crreate-servico.dto';

export class UpdateServicoDto extends PartialType(CreateServicoDto) {}
