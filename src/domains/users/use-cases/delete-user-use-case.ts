import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { isUUID } from '../../../utils/utils';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    if (!isUUID(command.id)) return null;
    return await this.usersRepository.deleteUser(command.id);
  }
}
