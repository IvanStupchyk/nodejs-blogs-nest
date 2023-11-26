import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../dto/users/user.input.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { UserViewType } from '../../../types/users.types';
import { User } from '../../../entities/users/user.entity';

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

    const newUser = new User();
    newUser.login = login;
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.isConfirmed = true;

    return this.usersRepository.createUser(newUser);
  }
}
