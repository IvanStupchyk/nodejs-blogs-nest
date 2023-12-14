import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../../entities/game/Game.entity';
import { GameStatus } from '../../../types/general.types';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async findActiveGameByUserId(userId: string): Promise<Game> {
    return await this.gamesRepository
      .createQueryBuilder('g')
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

  async findGameInActiveStatusByUserId(userId: string): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('g')
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

  async findGamesInActiveStatusToFinish(): Promise<Game[] | null> {
    return await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.answers', 'fra')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.answers', 'sca')
      .where(`g.status = '${GameStatus.Active}'`)
      .andWhere('g.timeToFinishGame < now()')
      .getMany();
  }

  async findCurrentGame(id): Promise<Game | null> {
    return await this.gamesRepository
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
      .where('g.id = :id', {
        id,
      })
      .orderBy('q.createdAt', 'DESC')
      .addOrderBy('fra.addedAt')
      .addOrderBy('sca.addedAt')
      .getOne();
  }

  async findPendingGame(): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('fp.user', 'fu')
      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.status = 'PendingSecondPlayer'`)
      .orderBy('q.createdAt', 'DESC')
      .getOne();
  }
}
