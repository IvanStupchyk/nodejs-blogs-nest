import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './Question.entity';
import { GameStatus } from '../../types/general.types';
import { Player } from './Player.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  status: GameStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  pairCreatedDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startGameDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishGameDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  timeToFinishGame: Date;

  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  firstPlayer: Player;

  @OneToOne(() => Player, (player) => player.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  secondPlayer: Player;

  @ManyToMany(() => Question, (question) => question.games)
  questions: Question[];

  static create(player: Player, questions: Question[]): Game {
    const game = new Game();

    game.firstPlayer = player;
    game.questions = questions;
    game.status = GameStatus.PendingSecondPlayer;

    return game;
  }

  static connectSecondPlayer(game: Game, player: Player) {
    game.secondPlayer = player;
    game.status = GameStatus.Active;
    game.startGameDate = new Date();
  }
}
