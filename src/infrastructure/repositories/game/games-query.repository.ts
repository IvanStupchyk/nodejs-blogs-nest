import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../../../entities/game/Player.entity';
import { Game } from '../../../entities/game/Game.entity';
import {
  GameViewType,
  TopPlayersType,
  UserGamesViewType,
  UserStatisticType,
} from '../../../types/game.types';
import { GameStatus } from '../../../types/general.types';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockGameModel } from '../../../constants/blanks';
import { GamesQueryDto } from '../../../dto/game/games.query.dto';
import { TopPlayersQueryDto } from '../../../dto/game/top-players.query.dto';
import { User } from '../../../entities/users/User.entity';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
      .where(
        new Brackets((qb) => {
          qb.where(`g.status = '${GameStatus.PendingSecondPlayer}'`).orWhere(
            `g.status = '${GameStatus.Active}'`,
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('fru.id = :userId', { userId }).orWhere('scu.id = :userId', {
            userId,
          });
        }),
      )
      .orderBy('q.createdAt', 'DESC')
      .addOrderBy('fra.addedAt')
      .addOrderBy('sca.addedAt')
      .getOne();

    return game ? this._resultMapper([game])[0] : null;
  }

  async getUserStatistic(userId: string): Promise<UserStatisticType> {
    const statistic = await this.playersRepository
      .createQueryBuilder('pl')
      .addSelect(
        (p) =>
          p
            .select('sum(p.score)')
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere(
              new Brackets((qb) => {
                qb.where('p.userId = :userId', { userId });
              }),
            ),
        'sumScore',
      )
      .addSelect(
        (p) =>
          p
            .select(
              'CASE WHEN AVG(p.score) % 1 = 0 THEN AVG(p.score)::INT ELSE ROUND(AVG(p.score), 2) END',
            )
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere(
              new Brackets((qb) => {
                qb.where('p.userId = :userId', { userId });
              }),
            ),
        'avgScores',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = :userId', { userId }).orWhere(
                  'spl.userId = :userId',
                  {
                    userId,
                  },
                );
              }),
            ),
        'gamesCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = :userId', { userId }).orWhere(
                  'spl.userId = :userId',
                  {
                    userId,
                  },
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.score = spl.score');
              }),
            ),
        'drawsCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = :userId', { userId }).orWhere(
                  'spl.userId = :userId',
                  {
                    userId,
                  },
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where(
                  `fpl.userId = :userId and fpl.score > spl.score or spl.userId = :userId and spl.score > fpl.score`,
                  { userId },
                );
              }),
            ),
        'winsCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = :userId', { userId }).orWhere(
                  'spl.userId = :userId',
                  {
                    userId,
                  },
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where(
                  `fpl.userId = :userId and fpl.score < spl.score or spl.userId = :userId and spl.score < fpl.score`,
                  { userId },
                );
              }),
            ),
        'lossesCount',
      )
      .where('pl.userId = :userId', {
        userId,
      })
      .getRawMany();

    return {
      sumScore: Number(statistic[0].sumScore),
      avgScores: Number(statistic[0].avgScores),
      gamesCount: Number(statistic[0].gamesCount),
      winsCount: Number(statistic[0].winsCount),
      lossesCount: Number(statistic[0].lossesCount),
      drawsCount: Number(statistic[0].drawsCount),
    };
  }

  async getTopPlayers(
    params: TopPlayersQueryDto,
  ): Promise<TopPlayersType | any> {
    const { pageNumber, pageSize, skipSize } = createDefaultSortedParams({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    });

    const topPlayers = await this.playersRepository
      .createQueryBuilder('pl')
      // .addSelect('pl.user', 'u_id')
      .select('DISTINCT(pl.user)')
      // .leftJoinAndSelect('pl.user', 'u')
      // .addSelect('pl.user', 'u_id')
      // .addSelect(
      //   (p) =>
      //     p
      //       .select('p.score')
      //       .from(Player, 'p')
      //       // .leftJoinAndSelect('p.user', 'u')
      //       // .addSelect('p.user', 'u')
      //       .where('p.finished = true')
      //       .andWhere(
      //         new Brackets((qb) => {
      //           qb.where('p.userId = pl.userId');
      //         }),
      //       )
      //       .andWhere(
      //         new Brackets((qb) => {
      //           qb.where('p.id = pl.id');
      //         }),
      //       ),
      //   'login',
      // )
      .addSelect(
        (p) =>
          p
            .select('sum(p.score)')
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere(
              new Brackets((qb) => {
                qb.where('p.userId = pl.userId');
              }),
            ),
        'sumScore',
      )
      .addSelect(
        (p) =>
          p
            .select(
              'CASE WHEN AVG(p.score) % 1 = 0 THEN AVG(p.score)::INT ELSE ROUND(AVG(p.score), 2) END',
            )
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere(
              new Brackets((qb) => {
                qb.where('p.userId = pl.userId');
              }),
            ),
        'avgScores',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = pl.userId').orWhere(
                  'spl.userId = pl.userId',
                );
              }),
            ),
        'gamesCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = pl.userId').orWhere(
                  'spl.userId = pl.userId',
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.score = spl.score');
              }),
            ),
        'drawsCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = pl.userId').orWhere(
                  'spl.userId = pl.userId',
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where(
                  `fpl.userId = pl.userId and fpl.score > spl.score or spl.userId = pl.userId and spl.score > fpl.score`,
                );
              }),
            ),
        'winsCount',
      )
      .addSelect(
        (g) =>
          g
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.firstPlayer', 'fpl')
            .leftJoin('g.secondPlayer', 'spl')
            .where(
              new Brackets((qb) => {
                qb.where(`g.status = '${GameStatus.Finished}'`);
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where('fpl.userId = pl.userId').orWhere(
                  'spl.userId = pl.userId',
                );
              }),
            )
            .andWhere(
              new Brackets((qb) => {
                qb.where(
                  `fpl.userId = pl.userId and fpl.score < spl.score or spl.userId = pl.userId and spl.score < fpl.score`,
                );
              }),
            ),
        'lossesCount',
      )
      .where('pl.finished = true')
      // .leftJoinAndSelect('pl.user', 'user')
      // .groupBy('pl.id, u.id')
      // .groupBy('pl.id, u.id, u.login')
      .getRawMany();

    console.log('topPlayers.length', topPlayers.length);
    console.log('topPlayers', topPlayers);
    // const finalPlayers = await this.usersRepository
    //   .createQueryBuilder('u')
    //   .leftJoinAndSelect('u.player', 'pl')
    //   .select('DISTINCT(pl.user)')
    //   // .leftJoinAndSelect('pl.user', 'user')
    //   // .groupBy('pl.id, u.id')
    //   // .groupBy('pl.id, u.id, u.login')
    //   .getRawMany();

    // console.log('finalPlayers.length', finalPlayers.length);
    // console.log('finalPlayers', finalPlayers);
    return topPlayers;
  }

  async getUserGames(
    params: GamesQueryDto,
    userId: string,
  ): Promise<UserGamesViewType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockGameModel,
      });

    const games = await this.gamesRepository
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
      .where(
        new Brackets((qb) => {
          qb.where(`g.status = '${GameStatus.Active}'`).orWhere(
            `g.status = '${GameStatus.Finished}'`,
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('fru.id = :userId', { userId }).orWhere('scu.id = :userId', {
            userId,
          });
        }),
      )
      // .orderBy({
      //   'fra.addedAt': 'ASC',
      //   'sca.addedAt': 'ASC',
      //   'q.createdAt': 'DESC',
      //   [`g.${sortBy}`]: sortDirection,
      //   'g.pairCreatedDate': 'DESC',
      // })
      .orderBy('q.createdAt', 'DESC')
      .addOrderBy(`g.${sortBy}`, sortDirection)
      .addOrderBy(`g.pairCreatedDate`, 'DESC')
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const gamesCount = await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.user', 'fru')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.user', 'scu')
      .where(
        new Brackets((qb) => {
          qb.where(`g.status = '${GameStatus.Active}'`).orWhere(
            `g.status = '${GameStatus.Finished}'`,
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('fru.id = :userId', { userId }).orWhere('scu.id = :userId', {
            userId,
          });
        }),
      )
      .getCount();

    const pagesCount = getPagesCount(gamesCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: gamesCount,
      items: games.length ? this._resultMapper(games) : [],
    };
  }

  _resultMapper(games: Game[]): GameViewType[] {
    return games.map((game) => {
      return {
        id: game.id,
        firstPlayerProgress: {
          answers: game.firstPlayer.answers
            ? game.firstPlayer.answers
                .map((a) => {
                  return {
                    questionId: a.question.id,
                    answerStatus: a.answerStatus,
                    addedAt: a.addedAt,
                  };
                })
                .sort((a, b) => a.addedAt.valueOf() - b.addedAt.valueOf())
            : [],
          player: {
            id: game.firstPlayer.user.id,
            login: game.firstPlayer.user.login,
          },
          score: game.firstPlayer.score,
        },
        secondPlayerProgress:
          game.status === GameStatus.Active ||
          game.status === GameStatus.Finished
            ? {
                answers: game.secondPlayer.answers
                  ? game.secondPlayer.answers
                      .map((a) => {
                        return {
                          questionId: a.question.id,
                          answerStatus: a.answerStatus,
                          addedAt: a.addedAt,
                        };
                      })
                      .sort((a, b) => a.addedAt.valueOf() - b.addedAt.valueOf())
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
          game.status === GameStatus.Active ||
          game.status === GameStatus.Finished
            ? game.questions.map((q) => {
                return { id: q.id, body: q.body };
              })
            : null,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };
    });
  }
}
