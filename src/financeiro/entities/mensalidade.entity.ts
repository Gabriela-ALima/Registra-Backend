import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Associado } from '../../associado/entities/associado.entity';

export enum SituacaoMensalidade {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  VENCIDA = 'VENCIDA',
}

@Entity({ name: 'tb_mensalidades' })
export class Mensalidade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Associado, { nullable: false })
  @JoinColumn({ name: 'associado_id' })
  associado: Associado;

  @Column({
    name: 'mes_referencia',
    type: 'varchar',
    length: 7,
    nullable: false,
  })
  mesReferencia: string;

  @Column({
    name: 'valor',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  valor: number;

  @Column({
    name: 'data_vencimento',
    type: 'date',
    nullable: false,
  })
  dataVencimento: string;

  @Column({
    name: 'data_pagamento',
    type: 'date',
    nullable: true,
  })
  dataPagamento: string | null;

  @Column({
    type: 'enum',
    enum: SituacaoMensalidade,
    enumName: 'situacao_mensalidade',
    default: SituacaoMensalidade.PENDENTE,
  })
  situacao: SituacaoMensalidade;

  @Column({
    name: 'observacao',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao: string | null;

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
