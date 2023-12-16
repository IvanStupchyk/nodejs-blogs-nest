import { Injectable } from '@nestjs/common';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
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
import { mockGameModel, mockToPlayers } from '../../../constants/blanks';
import { GamesQueryDto } from '../../../application/dto/game/games.query.dto';
import { TopPlayersQueryDto } from '../../../application/dto/game/top-players.query.dto';
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
            .andWhere('p.userId = :userId'),
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
            .andWhere('fpl.score = spl.score'),
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
      .select('pl.user', 'u_id')
      .addSelect('u.login', 'u_login')
      .leftJoin('pl.user', 'u')
      .addSelect(
        (p) =>
          p
            .select('sum(p.score)')
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere('p.userId = pl.userId'),
        'sumscore',
      )
      .addSelect(
        (p) =>
          p
            .select(
              'CASE WHEN AVG(p.score) % 1 = 0 THEN AVG(p.score)::INT ELSE ROUND(AVG(p.score), 2) END',
            )
            .from(Player, 'p')
            .where('p.finished = true')
            .andWhere('p.userId = pl.userId'),
        'avgscores',
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
        'gamescount',
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
        'drawscount',
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
        'winscount',
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
        'lossescount',
      )
      .where('pl.finished = true')
      .groupBy('u_id, u_login')
      .orderBy({
        avgscores: 'DESC',
        sumscore: 'DESC',
      })
      .offset(skipSize)
      .limit(pageSize);

    const finalSortedPlayers = await GamesQueryRepository._topPlayersSorting(
      topPlayers,
      params.sort,
    );

    const playerCount = await this.playersRepository
      .createQueryBuilder('pl')
      .select('count(distinct "userId")', 'count')
      .getRawOne();

    const pagesCount = getPagesCount(Number(playerCount.count), pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: Number(playerCount.count),
      items: finalSortedPlayers.length
        ? finalSortedPlayers.map((p) => {
            return {
              sumScore: Number(p.sumscore),
              avgScores: Number(p.avgscores),
              gamesCount: Number(p.gamescount),
              winsCount: Number(p.winscount),
              lossesCount: Number(p.lossescount),
              drawsCount: Number(p.drawscount),
              player: {
                id: p.u_id,
                login: p.u_login,
              },
            };
          })
        : [],
    };
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

  private _resultMapper(games: Game[]): GameViewType[] {
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

  private static async _topPlayersSorting(
    builder: SelectQueryBuilder<Player>,
    sort: Array<string> | string | undefined,
  ): Promise<any[]> {
    if (!sort || (typeof sort === 'object' && sort.length > 6)) {
      return builder.getRawMany();
    }

    const getOrder = (order: string): 'ASC' | 'DESC' =>
      order === 'asc' ? 'ASC' : 'DESC';

    if (typeof sort === 'string') {
      const [field, order] = sort.split(' ');
      if (mockToPlayers.hasOwnProperty(field)) {
        const finalOrder = getOrder(order);
        return builder.orderBy({ [field]: finalOrder }).getRawMany();
      }
    }

    if (typeof sort === 'object' && sort.length >= 2 && sort.length <= 6) {
      const orders = sort.map((s) => s.split(' '));
      const validFields = orders.every(([field]) =>
        mockToPlayers.hasOwnProperty(field),
      );

      if (validFields) {
        const orderByObject = orders.reduce((acc, [field, order]) => {
          acc[field] = getOrder(order);
          return acc;
        }, {});

        return builder.orderBy(orderByObject).getRawMany();
      }
    }

    return builder.getRawMany();
  }
}
