import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import bcrypt from 'bcrypt';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../../schemas/user.schema';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { NewUserDto } from '../../../dtos/users/new-user.dto';

export class CreateCommonUserCommand {
  constructor(public userData: NewUserDto) {}
}

@CommandHandler(CreateCommonUserCommand)
export class CreateCommonUserUseCase
  implements ICommandHandler<CreateCommonUserCommand>
{
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateCommonUserCommand): Promise<boolean> {
    const { login, email, password } = command.userData;

    const foundUserByLogin =
      await this.usersRepository.findUserByLoginOrEmail(login);

    const foundUserByEmail =
      await this.usersRepository.findUserByLoginOrEmail(email);

    if (foundUserByLogin && foundUserByEmail) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.uniqueEmail },
        { field: 'login', message: errorsConstants.user.uniqueLogin },
      ]);
    }

    if (foundUserByLogin) {
      errorMessageGenerator([
        { field: 'login', message: errorsConstants.user.uniqueLogin },
      ]);
    }

    if (foundUserByEmail) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.uniqueEmail },
      ]);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const smartUserModel = this.UserModel.createUser(
      login,
      email,
      passwordHash,
      false,
      this.UserModel,
    );

    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(smartUserModel);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      return false;
    }

    return !!(await this.usersRepository.save(smartUserModel));
  }
}
