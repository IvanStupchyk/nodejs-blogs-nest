import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../schemas/user.schema';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class ValidateUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: ValidateUserCommand): Promise<UserDocument | null> {
    const { loginOrEmail, password } = command;

    const user =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (user) {
      const isCredentialsCorrect = await bcrypt.compare(
        password,
        user.accountData.passwordHash,
      );

      if (isCredentialsCorrect) {
        return user;
      }
    }
    return null;
  }
}
