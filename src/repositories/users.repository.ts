import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async save(model: UserDocument) {
    return await model.save();
  }

  async deleteUser(id: ObjectId): Promise<boolean> {
    const result = await this.UserModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }
}
