import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './Answer.entity';
import { Game } from './Game.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @ManyToMany(() => Game, (game) => game.questions)
  @JoinTable()
  games: Game[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
