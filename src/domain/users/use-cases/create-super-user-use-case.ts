import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { UserViewType } from '../../../types/users.types';
import { User } from '../../../entities/users/User.entity';
import { SAUserInputDto } from '../../../application/dto/users/sa-user.input.dto';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class CreateSuperUserCommand {
  constructor(public userData: SAUserInputDto) {}
}

@CommandHandler(CreateSuperUserCommand)
export class CreateSuperUserUseCase
  implements ICommandHandler<CreateSuperUserCommand>
{
  constructor(private readonly dataSourceRepository: DataSourceRepository) {}

  async execute(command: CreateSuperUserCommand): Promise<UserViewType> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User();
    newUser.login = login;
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.isConfirmed = true;

    const savedUser = await this.dataSourceRepository.save(newUser);

    return {
      id: savedUser.id,
      login: savedUser.login,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }
}
