import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../../../entities/game/Player.entity';
import { Game } from '../../../entities/game/Game.entity';
import { GameStatus } from '../../../types/general.types';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async findActiveGameByUserId(userId: string): Promise<Game> {
    return await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'fp')
      .leftJoinAndSelect('g.secondPlayer', 'sp')
      .where('fp.userId = :userId or sp.userId = :userId', {
        userId,
      })
      .andWhere(`g.status = 'PendingSecondPlayer' or g.status = 'Active'`)
      .getOne();
  }

  async findGameInActiveStatusByUserId(userId: string): Promise<Game> {
    return await this.gamesRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'frp')
      .leftJoinAndSelect('frp.answers', 'fra')
      .leftJoinAndSelect('frp.user', 'fru')
      .leftJoinAndSelect('g.secondPlayer', 'scp')
      .leftJoinAndSelect('scp.answers', 'sca')
      .leftJoinAndSelect('scp.user', 'scu')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.status = :active`, {
        active: GameStatus.Active,
      })
      .andWhere('frp.userId = :userId or scp.userId = :userId', {
        userId,
      })
      .getOne();
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
