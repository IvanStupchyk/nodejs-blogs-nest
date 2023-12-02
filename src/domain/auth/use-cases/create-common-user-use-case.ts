import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UserInputDto } from '../../../dto/users/user.input.dto';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
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

    const newUser = new User();
    newUser.login = login;
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.isConfirmed = false;
    newUser.confirmationCode = uuidv4();
    newUser.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(newUser);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      return false;
    }

    return !!(await this.dataSourceRepository.save(newUser));
  }
}
