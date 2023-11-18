import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';
import { UserType } from '../../../types/rawSqlTypes/user';

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
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: ValidateUserCommand): Promise<UserType | null> {
    const { loginOrEmail, password } = command;

    const user =
      await this.usersSqlRepository.findUserByLoginOrEmail(loginOrEmail);

    if (user) {
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
