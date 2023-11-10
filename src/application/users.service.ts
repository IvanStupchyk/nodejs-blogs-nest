import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { ViewUserModel } from '../controllers/users/models/view-user.model';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../schemas/user.schema';
import { NewUserDto } from '../controllers/users/models/new-user.dto';
import { validateOrRejectModel } from '../utils/validate-or-reject.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async createUser(userData: NewUserDto): Promise<ViewUserModel> {
    await validateOrRejectModel(userData, NewUserDto);

    const { login, password, email } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const smartUserModel = this.UserModel.createUser(
      login,
      email,
      passwordHash,
      true,
      this.UserModel,
    );

    await this.usersRepository.save(smartUserModel);

    return {
      id: smartUserModel.id,
      login: smartUserModel.accountData.login,
      email: smartUserModel.accountData.email,
      createdAt: smartUserModel.accountData.createdAt,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return await this.usersRepository.deleteUser(new ObjectId(id));
  }
}
