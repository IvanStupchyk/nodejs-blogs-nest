import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('invalidRefreshTokens')
export class InvalidRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.invalidRefreshToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
