import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UserInputDto } from '../../../application/dto/users/user.input.dto';
import { User } from '../../../entities/users/User.entity';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class CreateCommonUserCommand {
  constructor(public userData: UserInputDto) {}
}

@CommandHandler(CreateCommonUserCommand)
export class CreateCommonUserUseCase
  implements ICommandHandler<CreateCommonUserCommand>
{
  constructor(private readonly dataSourceRepository: DataSourceRepository) {}

  async execute(command: CreateCommonUserCommand): Promise<boolean> {
    const { login, email, password } = command.userData;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = User.createCommonUser(login, email, passwordHash);

    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(newUser);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      return false;
    }

    return !!(await this.dataSourceRepository.save(newUser));
  }
}
