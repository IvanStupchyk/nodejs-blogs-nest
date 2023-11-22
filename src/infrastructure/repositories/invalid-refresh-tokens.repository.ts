import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InvalidRefreshTokenType } from '../../types/rawSqlTypes/generalTypes';

@Injectable()
export class InvalidRefreshTokensRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async deleteInvalidRefreshTokens() {
    return await this.dataSource.query(`
    DELETE from
    public."invalidRefreshTokens"
    `);
  }

  async getAllInvalidRefreshTokens(
    userId: string,
  ): Promise<Array<InvalidRefreshTokenType>> {
    return await this.dataSource.query(
      `
      select "id", "userId", "refreshToken", "createdAt"
      from public."invalidRefreshTokens"
      where "userId" = $1
    `,
      [userId],
    );
  }

  async addInvalidRefreshTokens(
    newInvalidRefreshToken: InvalidRefreshTokenType,
  ): Promise<boolean> {
    const { id, refreshToken, userId, createdAt } = newInvalidRefreshToken;

    await this.dataSource.query(
      `
      insert into
      public."invalidRefreshTokens"("id", "userId", "refreshToken", "createdAt")
      VALUES ($1, $2, $3, $4)
    `,
      [id, userId, refreshToken, createdAt],
    );

    return true;
  }
}
