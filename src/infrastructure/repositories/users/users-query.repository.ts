import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../../../application/dto/users/users.query.dto';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockBanUserModel, mockUserModel } from '../../../constants/blanks';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BannedUsersForBlogViewType,
  UsersViewType,
  UserViewType,
} from '../../../types/users.types';
import { User } from '../../../entities/users/User.entity';
import { BanUsersQueryDto } from '../../../application/dto/blogs/ban-users.query.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getSortedUsers(params: UsersQueryDto): Promise<UsersViewType> {
    const { searchLoginTerm, searchEmailTerm, banStatus } = params;

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
      .andWhere(
        `${
          typeof banStatus !== 'undefined'
            ? 'ubi.isBanned = :banStatus'
            : 'ubi.isBanned is not null'
        }`,
        { banStatus },
      )
      .orderBy(`u.${sortBy}`, sortDirection)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const usersCount = await this.usersRepository
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
      .andWhere(
        `${
          typeof banStatus !== 'undefined'
            ? 'ubi.isBanned = :banStatus'
            : 'ubi.isBanned is not null'
        }`,
        { banStatus },
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

  async getSortedBannedUserForSpecifiedBlog(
    blogId: string,
    params: BanUsersQueryDto,
  ): Promise<BannedUsersForBlogViewType> {
    const { searchLoginTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBanUserModel,
      });

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.userBanByBlogger', 'ubbl')
      .where(`${searchLoginTerm ? `(u.login ilike :login)` : ''}`, {
        login: `%${searchLoginTerm}%`,
      })
      .andWhere('ubbl.isBanned = true')
      .andWhere('ubbl.blogId = :blogId', {
        blogId,
      })
      .orderBy(`u.${sortBy}`, sortDirection)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const usersCount = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.userBanByBlogger', 'ubbl')
      .where(`${searchLoginTerm ? `(u.login ilike :login)` : ''}`, {
        login: `%${searchLoginTerm}%`,
      })
      .andWhere('ubbl.isBanned = true')
      .andWhere('ubbl.blogId = :blogId', {
        blogId,
      })
      .skip(skipSize)
      .take(pageSize)
      .getCount();

    const pagesCount = getPagesCount(usersCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: users.length
        ? users.map((u) => {
            return {
              id: u.id,
              login: u.login,
              banInfo: {
                isBanned: u.userBanByBlogger.isBanned,
                banDate: u.userBanByBlogger.banDate,
                banReason: u.userBanByBlogger.banReason,
              },
            };
          })
        : [],
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
