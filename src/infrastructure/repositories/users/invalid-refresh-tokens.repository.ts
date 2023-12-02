import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvalidRefreshToken } from '../../../entities/users/Invalid-refresh-tokens.entity';

@Injectable()
export class InvalidRefreshTokensRepository {
  constructor(
    @InjectRepository(InvalidRefreshToken)
    private readonly invalidRefreshTokensRepository: Repository<InvalidRefreshToken>,
  ) {}

  async getAllInvalidRefreshTokens(
    userId: string,
  ): Promise<Array<InvalidRefreshToken>> {
    return await this.invalidRefreshTokensRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .getMany();
  }
}
