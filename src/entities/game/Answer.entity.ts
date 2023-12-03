import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './Question.entity';
import { AnswerStatus } from '../../types/general.types';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  answerStatus: AnswerStatus;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;
}
