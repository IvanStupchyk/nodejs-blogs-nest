import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { ObjectId } from 'mongodb';
import { ShowOwnUserDataType } from '../../../types/users.types';

export class GetCurrentUserCommand {
  constructor(public id: ObjectId) {}
}

@CommandHandler(GetCurrentUserCommand)
export class GetCurrentUserUseCase
  implements ICommandHandler<GetCurrentUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetCurrentUserCommand): Promise<ShowOwnUserDataType> {
    const user = await this.usersRepository.findUserById(
      new ObjectId(command.id),
    );
    return {
      userId: user.id,
      email: user.email,
      login: user.login,
    };
  }
}
