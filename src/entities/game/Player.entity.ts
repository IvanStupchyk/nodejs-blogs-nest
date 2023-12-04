import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/User.entity';
import { Game } from './Game.entity';
import { Answer } from './Answer.entity';

@Entity('gamePlayers')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @ManyToOne(() => User, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  @OneToOne(() => Game)
  game: Game;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
