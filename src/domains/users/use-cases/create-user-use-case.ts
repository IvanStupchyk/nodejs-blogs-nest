import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { NewUserDto } from '../../../dtos/users/new-user.dto';
import { ViewUserModel } from '../../../controllers/users/models/view-user.model';

export class CreateUserCommand {
  constructor(public userData: NewUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<ViewUserModel> {
    return await this.usersService.createUser(command.userData);
  }
}
