import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './Question.entity';
import { AnswerStatus } from '../../types/general.types';
import { Player } from './Player.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  answerStatus: AnswerStatus;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: Question;

  @ManyToOne(() => Player, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  player: Player;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  static create(player: Player, question: Question): Answer {
    const answer = new Answer();

    answer.player = player;
    answer.addedAt = new Date();
    answer.question = question;

    return answer;
  }

  static correctAnswer(answer: Answer, player: Player) {
    answer.answerStatus = AnswerStatus.Correct;
    player.score = ++player.score;
  }

  static incorrectAnswer(answer: Answer) {
    answer.answerStatus = AnswerStatus.Incorrect;
  }
}
