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
import { dtoExceptionsValidation } from '../../utils/errors/DtoExceptionsValidation';

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

  static create(body: string, correctAnswers: string[]): Question {
    dtoExceptionsValidation('questionDtoValidation', {
      body,
      correctAnswers,
    });

    const question = new Question();

    question.body = body;
    question.correctAnswers = correctAnswers;

    return question;
  }

  static update(
    question: Question,
    body: string,
    correctAnswers: string[],
  ): Question {
    dtoExceptionsValidation('questionDtoValidation', {
      body,
      correctAnswers,
    });

    question.body = body;
    question.correctAnswers = correctAnswers;
    question.updatedAt = new Date();

    return question;
  }
}
