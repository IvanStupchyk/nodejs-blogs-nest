import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ShowOwnUserDataType } from '../../../types/users.types';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class GetCurrentUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetCurrentUserCommand)
export class GetCurrentUserUseCase
  implements ICommandHandler<GetCurrentUserCommand>
{
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: GetCurrentUserCommand): Promise<ShowOwnUserDataType> {
    const user = await this.usersSqlRepository.fetchAllUserDataById(command.id);

    return {
      userId: user.id,
      email: user.email,
      login: user.login,
    };
  }
}
