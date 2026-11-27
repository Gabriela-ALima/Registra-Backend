import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tb_servicos' })
export class Servico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nome: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descricao: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  local: string | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  capacidade: number | null;

  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  ativo: boolean;

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
