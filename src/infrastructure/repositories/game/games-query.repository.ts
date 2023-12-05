import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../../../entities/game/Player.entity';
import { Game } from '../../../entities/game/Game.entity';
import { GameViewType } from '../../../types/game.types';
import { GameStatus } from '../../../types/general.types';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async findGameForSpecifiedUser(userId: string): Promise<GameViewType | null> {
    const game = await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.answers', 'fra')
      .leftJoinAndSelect('fra.question', 'fraq')
      .leftJoinAndSelect('frp.user', 'fru')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.answers', 'sca')
      .leftJoinAndSelect('sca.question', 'scaq')
      .leftJoinAndSelect('scp.user', 'scu')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`fru.id = :userId or scu.id = :userId`, {
        userId,
      })
      // .andWhere(`g.status = 'PendingSecondPlayer' or g.status = 'Active'`)
      // .andWhere(`g.status != 'Finished'`)
      .orderBy('fra.addedAt')
      .addOrderBy('sca.addedAt')
      .addOrderBy('q.createdAt', 'DESC')
      .getOne();

    return game && game.status !== GameStatus.Finished
      ? {
          id: game.id,
          firstPlayerProgress: {
            answers: game.firstPlayer.answers
              ? game.firstPlayer.answers.map((a) => {
                  return {
                    questionId: a.question.id,
                    answerStatus: a.answerStatus,
                    addedAt: a.addedAt,
                  };
                })
              : [],
            player: {
              id: game.firstPlayer.user.id,
              login: game.firstPlayer.user.login,
            },
            score: game.firstPlayer.score,
          },
          secondPlayerProgress:
            game.status === GameStatus.Active
              ? {
                  answers: game.secondPlayer.answers
                    ? game.secondPlayer.answers.map((a) => {
                        return {
                          questionId: a.question.id,
                          answerStatus: a.answerStatus,
                          addedAt: a.addedAt,
                        };
                      })
                    : [],
                  player: {
                    id: game.secondPlayer.user.id,
                    login: game.secondPlayer.user.login,
                  },
                  score: game.secondPlayer.score,
                }
              : null,
          status: game.status,
          questions:
            game.status === GameStatus.Active
              ? game.questions.map((q) => {
                  return { id: q.id.toString(), body: q.body };
                })
              : null,
          pairCreatedDate: game.pairCreatedDate,
          startGameDate: game.startGameDate,
          finishGameDate: game.finishGameDate,
        }
      : null;
  }
}
