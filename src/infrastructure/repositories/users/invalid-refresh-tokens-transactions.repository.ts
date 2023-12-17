import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InvalidRefreshToken } from '../../../entities/users/Invalid-refresh-tokens.entity';

@Injectable()
export class InvalidRefreshTokensTransactionsRepository {
  async getAllInvalidRefreshTokens(
    userId: string,
    manager: EntityManager,
  ): Promise<Array<InvalidRefreshToken>> {
    return await manager
      .createQueryBuilder(InvalidRefreshToken, 't')
      .where('t.userId = :userId', { userId })
      .getMany();
  }
}
