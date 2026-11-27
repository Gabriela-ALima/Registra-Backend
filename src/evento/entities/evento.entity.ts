import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SituacaoEvento } from '../../common/enums/situacao-evento.enum';

@Entity({ name: 'tb_eventos' })
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'date', nullable: false })
  data: string;

  @Column({ type: 'time', nullable: false })
  horario: string;

  @Column({ length: 150, nullable: false })
  local: string;

  @Column({ name: 'capacidade_maxima', type: 'int', nullable: true })
  capacidadeMaxima: number | null;

  @Column({
    type: 'enum',
    enum: SituacaoEvento,
    enumName: 'situacao_evento',
    default: SituacaoEvento.ATIVO,
  })
  situacao: SituacaoEvento;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
