import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ShowOwnUserDataType } from '../../../types/users.types';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class GetCurrentUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetCurrentUserCommand)
export class GetCurrentUserUseCase
  implements ICommandHandler<GetCurrentUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetCurrentUserCommand): Promise<ShowOwnUserDataType> {
    const user = await this.usersRepository.fetchAllUserDataById(command.id);

    return user
      ? {
          userId: user.id,
          email: user.email,
          login: user.login,
        }
      : null;
  }
}
