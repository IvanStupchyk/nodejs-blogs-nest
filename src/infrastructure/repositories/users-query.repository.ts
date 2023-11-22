import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../../dto/users/users.query.dto';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockUserModel } from '../../constants/blanks';
import { UsersType } from '../../types/users.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getSortedUsers(params: UsersQueryDto): Promise<UsersType> {
    const { searchLoginTerm, searchEmailTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockUserModel,
      });

    let login = '%';
    let email = '%';

    if (searchLoginTerm && !searchEmailTerm) {
      login = `%${searchLoginTerm}%`;
      email = '';
    }

    if (searchEmailTerm && !searchLoginTerm) {
      email = `%${searchEmailTerm}%`;
      login = '';
    }

    if (searchEmailTerm && searchLoginTerm) {
      email = `%${searchEmailTerm}%`;
      login = `%${searchLoginTerm}%`;
    }

    const users = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt"
    from public.users
    where ("login" ilike $3 or "email" ilike $4)
    order by "${sortBy}" ${sortDirection}
    limit $1 offset $2`,
      [pageSize, skipSize, login, email],
    );

    const usersCount = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt"
    from public.users
    where ("login" ilike $1 or "email" ilike $2)`,
      [login, email],
    );

    const totalUsersCount = usersCount.length;
    const pagesCount = getPagesCount(totalUsersCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: totalUsersCount,
      items: users,
    };
  }

  async deleteAllUsers() {
    return this.dataSource.query(`
    Delete from public.users
    `);
  }
}
