import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { NewUserDto } from '../../../dtos/users/new-user.dto';
import { ViewUserModel } from '../../../controllers/users/models/view-user.model';

export class CreateSuperUserCommand {
  constructor(public userData: NewUserDto) {}
}

@CommandHandler(CreateSuperUserCommand)
export class CreateSuperUserUseCase
  implements ICommandHandler<CreateSuperUserCommand>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateSuperUserCommand): Promise<ViewUserModel> {
    return await this.usersService.createUser(command.userData);
  }
}
