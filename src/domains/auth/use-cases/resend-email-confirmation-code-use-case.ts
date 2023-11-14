import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';

export class ResendEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailConfirmationCodeCommand)
export class ResendEmailConfirmationCodeUseCase
  implements ICommandHandler<ResendEmailConfirmationCodeCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ResendEmailConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    );
    if (!user || user.emailConfirmation.isConfirmed) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.checkEmail },
      ]);
    }

    const newCode = uuidv4();
    const newExpirationDate = add(new Date(), { hours: 1, minutes: 30 });

    user.updateConfirmationCodeAndExpirationTime(newExpirationDate, newCode);
    await this.usersRepository.save(user);

    try {
      await emailTemplatesManager.resendEmailConfirmationMessage(
        user.accountData.email,
        newCode,
      );
    } catch (error) {
      console.log('resendEmailConfirmationMessage error', error);
    }

    return true;
  }
}
