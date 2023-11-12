import { Injectable } from '@nestjs/common';
import { GetSortedUsersModel } from '../../controllers/users/models/get-sorted-users.model';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockUserModel } from '../../constants/blanks';
import { UsersType } from '../../types/users.types';
import { UserType } from '../../dtos/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  async getSortedUsers(params: GetSortedUsersModel): Promise<UsersType> {
    const { searchLoginTerm, searchEmailTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockUserModel,
      });

    let findCondition = {};

    if (searchLoginTerm && !searchEmailTerm) {
      findCondition = {
        'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
      };
    }

    if (searchEmailTerm && !searchLoginTerm) {
      findCondition = {
        'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
      };
    }

    if (searchEmailTerm && searchLoginTerm) {
      findCondition = {
        $or: [
          { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
          { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
        ],
      };
    }

    const sortField = `accountData.${sortBy}`;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const users: Array<UserType> = await this.UserModel.find(findCondition, {
      _id: 0,
      __v: 0,
    })
      .sort({ [sortField]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const usersCount = await this.UserModel.countDocuments(findCondition);

    const pagesCount = getPagesCount(usersCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: users.map((u) => {
        return {
          id: u.id,
          email: u.accountData.email,
          login: u.accountData.login,
          createdAt: u.accountData.createdAt,
        };
      }),
    };
  }
}
