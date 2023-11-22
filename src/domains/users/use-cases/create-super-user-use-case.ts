import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewUserDto } from '../../../dtos/users/new-user.dto';
import { ViewUserModel } from '../../../controllers/users/models/view-user.model';
import { UserType } from '../../../types/rawSqlTypes/user';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class CreateSuperUserCommand {
  constructor(public userData: NewUserDto) {}
}

@CommandHandler(CreateSuperUserCommand)
export class CreateSuperUserUseCase
  implements ICommandHandler<CreateSuperUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateSuperUserCommand): Promise<ViewUserModel> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserType = {
      id: uuidv4(),
      email,
      login,
      passwordHash,
      confirmationCode: uuidv4(),
      expirationDate: new Date().toISOString(),
      isConfirmed: true,
      createdAt: new Date().toISOString(),
    };

    return this.usersRepository.createUser(newUser);
  }
}
