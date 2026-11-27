import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tb_termos' })
export class Termo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true, nullable: false })
  versao: string;

  @Column({ type: 'text', nullable: false })
  conteudo: string;

  @Column({ default: false })
  vigente: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
