import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../../../application/dto/users/users.query.dto';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockUserModel } from '../../../constants/blanks';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersViewType, UserViewType } from '../../../types/users.types';
import { User } from '../../../entities/users/User.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getSortedUsers(params: UsersQueryDto): Promise<UsersViewType> {
    const { searchLoginTerm, searchEmailTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockUserModel,
      });

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where(
        `${
          searchLoginTerm || searchEmailTerm
            ? `(u.login ilike :login OR u.email ilike :email)`
            : 'u.login is not null'
        }`,
        {
          login: `%${searchLoginTerm}%`,
          email: `%${searchEmailTerm}%`,
        },
      )
      .orderBy(`u.${sortBy}`, sortDirection)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const usersCount = await this.usersRepository
      .createQueryBuilder('u')
      .where(
        `${
          searchLoginTerm || searchEmailTerm
            ? `(u.login ilike :login OR u.email ilike :email)`
            : 'u.login is not null'
        }`,
        {
          login: `%${searchLoginTerm}%`,
          email: `%${searchEmailTerm}%`,
        },
      )
      .getCount();

    const pagesCount = getPagesCount(usersCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: this._usersMapper(users),
    };
  }

  _usersMapper(users: Array<User>): Array<UserViewType> {
    return users.length
      ? users.map((u) => {
          return {
            id: u.id.toString(),
            login: u.login,
            email: u.email,
            createdAt: u.createdAt,
            banInfo: {
              isBanned: u.userBanInfo.isBanned,
              banDate: u.userBanInfo.banDate,
              banReason: u.userBanInfo.banReason,
            },
          };
        })
      : [];
  }
}
