import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Associado } from '../../associado/entities/associado.entity';
import { SituacaoInscricao } from '../../common/enums/situacao-inscricao.enum';
import { Evento } from '../../evento/entities/evento.entity';

@Entity({ name: 'tb_inscricoes_eventos' })
@Unique(['evento', 'associado'])
export class InscricaoEvento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evento, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @ManyToOne(() => Associado, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'associado_id' })
  associado: Associado;

  @Column({
    type: 'enum',
    enum: SituacaoInscricao,
    enumName: 'situacao_inscricao',
    default: SituacaoInscricao.CONFIRMADA,
  })
  situacao: SituacaoInscricao;

  @Column({
    name: 'confirmada_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  confirmadaEm: Date;

  @Column({ name: 'cancelada_em', type: 'timestamp', nullable: true })
  canceladaEm: Date | null;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
