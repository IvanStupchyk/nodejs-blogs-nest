import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../dto/users/user.input.dto';
import { UserViewType } from '../../../types/user-view.type';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { UserModel } from '../../../models/users/User.model';

export class CreateSuperUserCommand {
  constructor(public userData: UserInputDto) {}
}

@CommandHandler(CreateSuperUserCommand)
export class CreateSuperUserUseCase
  implements ICommandHandler<CreateSuperUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateSuperUserCommand): Promise<UserViewType> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new UserModel(
      uuidv4(),
      email,
      login,
      passwordHash,
      uuidv4(),
      new Date().toISOString(),
      true,
      new Date().toISOString(),
    );

    return this.usersRepository.createUser(newUser);
  }
}
