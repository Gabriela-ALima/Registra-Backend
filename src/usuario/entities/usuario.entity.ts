import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Associado } from '../../associado/entities/associado.entity';
import { Perfil } from '../../common/enums/perfil.enum';

@Entity({ name: 'tb_usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150, unique: true, nullable: false })
  email: string;

  @Column({
    name: 'senha_criptografada',
    length: 100,
    nullable: false,
    select: false,
  })
  senhaCriptografada: string;

  @Column({
    type: 'enum',
    enum: Perfil,
    enumName: 'perfil',
    nullable: false,
  })
  perfil: Perfil;

  @Column({ default: true })
  ativo: boolean;

  @OneToOne(() => Associado, { nullable: true })
  @JoinColumn({ name: 'associado_id' })
  associado: Associado | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
