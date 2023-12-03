import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './Answer.entity';

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

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
