import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return await this.usersSqlRepository.deleteUser(command.id);
  }
}
