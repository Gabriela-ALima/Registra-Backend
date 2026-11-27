import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Associado } from '../../associado/entities/associado.entity';
import { Termo } from './termo.entity';

@Entity({ name: 'tb_termos_aceite' })
@Unique(['associado', 'termo'])
export class TermoAceite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Associado, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'associado_id' })
  associado: Associado;

  @ManyToOne(() => Termo, { nullable: false })
  @JoinColumn({ name: 'termo_id' })
  termo: Termo;

  @CreateDateColumn({ name: 'aceito_em' })
  aceitoEm: Date;
}
