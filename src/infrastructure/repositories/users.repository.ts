import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../schemas/user.schema';
import { ViewUserModel } from '../../controllers/users/models/view-user.model';
import { UserCommentLikesType } from '../../types/general.types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async save(model: UserDocument) {
    return await model.save();
  }

  async findUserById(id: ObjectId): Promise<ViewUserModel | null> {
    const user = await this.UserModel.findOne(
      { id },
      { _id: 0, __v: 0 },
    ).exec();

    return user
      ? {
          id: user.id,
          login: user.accountData.login,
          email: user.accountData.email,
          createdAt: user.accountData.createdAt,
        }
      : null;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findUserCommentLikesById(
    id: ObjectId,
  ): Promise<Array<UserCommentLikesType> | null> {
    const user = await this.UserModel.findOne({ id }).exec();

    return user ? [...user.commentsLikes] : null;
  }

  async fetchAllUserDataById(id: ObjectId): Promise<UserDocument | null> {
    return this.UserModel.findOne({ id });
  }

  async deleteUser(id: ObjectId): Promise<boolean> {
    const result = await this.UserModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }
}
