import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { UserType } from '../../../types/users.types';

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
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ValidateUserCommand): Promise<UserType | null> {
    const { loginOrEmail, password } = command;

    const user =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (user && !user.userBanInfo.isBanned) {
      const isCredentialsCorrect = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (isCredentialsCorrect) {
        return user;
      }
    }
    return null;
  }
}
