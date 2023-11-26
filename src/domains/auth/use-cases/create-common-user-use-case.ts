import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import bcrypt from 'bcrypt';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UserInputDto } from '../../../dto/users/user.input.dto';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { User } from '../../../entities/users/user.entity';

export class CreateCommonUserCommand {
  constructor(public userData: UserInputDto) {}
}

@CommandHandler(CreateCommonUserCommand)
export class CreateCommonUserUseCase
  implements ICommandHandler<CreateCommonUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

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

    const newUser = new User();
    newUser.login = login;
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.isConfirmed = false;
    newUser.confirmationCode = uuidv4();
    newUser.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(newUser);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      return false;
    }

    return !!(await this.usersRepository.createUser(newUser));
  }
}
