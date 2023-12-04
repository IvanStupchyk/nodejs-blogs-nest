import { Controller, Delete, HttpCode } from '@nestjs/common';
import { RouterPaths } from '../../constants/router.paths';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class ResetDbController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete(`${RouterPaths.testing}/all-data`)
  @HttpCode(204)
  async resetDb() {
    // await this.dataSource.query(`DROP DATABASE IF EXISTS "postgres_typeorm";`);
    // await this.dataSource.query(`SELECT truncate_tables('postgres_typeorm');`);
    await this.dataSource.query('DELETE from "blogs"');
    await this.dataSource.query('DELETE from "comments"');
    await this.dataSource.query('DELETE from "commentLikes"');
    await this.dataSource.query('DELETE from "devices"');
    await this.dataSource.query('DELETE from "posts"');
    await this.dataSource.query('DELETE from "postLikes"');
    await this.dataSource.query('DELETE from "invalidRefreshTokens"');
    await this.dataSource.query('DELETE from "questions"');
    await this.dataSource.query('DELETE from "answers"');
    await this.dataSource.query('DELETE from "games"');
    await this.dataSource.query('DELETE from "gamePlayers"');
    await this.dataSource.query('DELETE from "questions_games_games"');
    await this.dataSource.query('DELETE from "users"');
  }
}
