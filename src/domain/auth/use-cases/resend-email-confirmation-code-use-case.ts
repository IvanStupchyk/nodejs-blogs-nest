import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class ResendEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailConfirmationCodeCommand)
export class ResendEmailConfirmationCodeUseCase
  implements ICommandHandler<ResendEmailConfirmationCodeCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: ResendEmailConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    );
    if (!user || user.isConfirmed) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.checkEmail },
      ]);
    }

    const newCode = uuidv4();

    user.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    user.confirmationCode = newCode;
    await this.dataSourceRepository.save(user);

    try {
      await emailTemplatesManager.resendEmailConfirmationMessage(
        command.email,
        newCode,
      );
    } catch (error) {
      console.log('resendEmailConfirmationMessage error', error);
    }

    return true;
  }
}
