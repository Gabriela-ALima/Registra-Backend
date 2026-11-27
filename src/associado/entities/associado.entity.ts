import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SituacaoAssociado } from '../../common/enums/situacao-associado.enum';

@Entity({ name: 'tb_associados' })
export class Associado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'nome_completo',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nomeCompleto: string;

  @Column({
    type: 'varchar',
    length: 11,
    unique: true,
    nullable: false,
  })
  cpf: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefone: string | null;

  @Column({
    name: 'data_nascimento',
    type: 'date',
    nullable: false,
  })
  dataNascimento: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  endereco: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  cidade: string;

  @Column({
    type: 'varchar',
    length: 2,
    nullable: false,
  })
  estado: string;

  @Column({
    type: 'enum',
    enum: SituacaoAssociado,
    enumName: 'situacao_associado',
    default: SituacaoAssociado.ATIVO,
    nullable: false,
  })
  situacao: SituacaoAssociado;

  @Column({
    name: 'cadastro_concluido',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  cadastroConcluido: boolean;

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
