import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvalidRefreshToken } from '../../entities/users/invalid-refresh-tokens.entity';

@Injectable()
export class InvalidRefreshTokensRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(InvalidRefreshToken)
    private readonly invalidRefreshTokensRepository: Repository<InvalidRefreshToken>,
  ) {}
  async deleteInvalidRefreshTokens(): Promise<boolean> {
    const result = await this.invalidRefreshTokensRepository
      .createQueryBuilder('t')
      .delete()
      .from(InvalidRefreshToken)
      .execute();

    return !!result.affected;
  }

  async save(invalidRefreshToken: InvalidRefreshToken): Promise<boolean> {
    return !!(await this.invalidRefreshTokensRepository.save(
      invalidRefreshToken,
    ));
  }

  async getAllInvalidRefreshTokens(
    userId: string,
  ): Promise<Array<InvalidRefreshToken>> {
    return await this.invalidRefreshTokensRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .getMany();
  }
}
