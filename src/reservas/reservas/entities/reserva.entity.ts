import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Servico } from '../../servicos/entities/servico.entity';
import { Associado } from '../../../associado/entities/associado.entity';

export enum SituacaoReserva {
  PENDENTE = 'PENDENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}

@Entity({ name: 'tb_reservas' })
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Servico, { nullable: false })
  @JoinColumn({ name: 'servico_id' })
  servico: Servico;

  @ManyToOne(() => Associado, { nullable: false })
  @JoinColumn({ name: 'associado_id' })
  associado: Associado;

  @Column({
    name: 'data_reserva',
    type: 'date',
    nullable: false,
  })
  dataReserva: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: false,
  })
  horario: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao: string | null;

  @Column({
    type: 'enum',
    enum: SituacaoReserva,
    enumName: 'situacao_reserva',
    default: SituacaoReserva.PENDENTE,
  })
  situacao: SituacaoReserva;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}
