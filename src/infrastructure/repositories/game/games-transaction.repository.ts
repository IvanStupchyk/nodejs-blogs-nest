import { Injectable } from '@nestjs/common';
import { Brackets, EntityManager } from 'typeorm';
import { Game } from '../../../entities/game/Game.entity';
import { GameStatus } from '../../../types/general.types';

@Injectable()
export class GamesTransactionRepository {
  async findActiveGameByUserId(
    userId: string,
    manager: EntityManager,
  ): Promise<Game> {
    return await manager
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .where(
        new Brackets((qb) => {
          qb.where(`g.status = '${GameStatus.PendingSecondPlayer}'`).orWhere(
            `g.status = '${GameStatus.Active}'`,
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('fp.userId = :userId', { userId }).orWhere(
            'sp.userId = :userId',
            {
              userId,
            },
          );
        }),
      )
      .getOne();
  }

  async findGameInActiveStatusByUserId(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    return await manager
      .createQueryBuilder(Game, 'g')
      .setLock('pessimistic_write', undefined, ['g'])
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.answers', 'fra')
      .leftJoinAndSelect('frp.user', 'fru')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.answers', 'sca')
      .leftJoinAndSelect('scp.user', 'scu')
      .leftJoinAndSelect('g.questions', 'q')
      .where(
        new Brackets((qb) => {
          qb.where(`g.status = '${GameStatus.Active}'`);
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
      .getOne();
  }

  async findGamesInActiveStatusToFinish(
    manager: EntityManager,
  ): Promise<Game[] | null> {
    return await manager
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.answers', 'fra')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.answers', 'sca')
      .where(`g.status = '${GameStatus.Active}'`)
      .andWhere('g.timeToFinishGame < now()')
      .getMany();
  }

  async findPendingGame(manager: EntityManager): Promise<Game | null> {
    return await manager
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('fp.user', 'fu')
      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.status = 'PendingSecondPlayer'`)
      .orderBy('q.createdAt', 'DESC')
      .getOne();
  }
}
