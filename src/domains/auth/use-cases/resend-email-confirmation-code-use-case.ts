import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class ResendEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailConfirmationCodeCommand)
export class ResendEmailConfirmationCodeUseCase
  implements ICommandHandler<ResendEmailConfirmationCodeCommand>
{
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: ResendEmailConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersSqlRepository.findUserByLoginOrEmail(
      command.email,
    );
    if (!user || user.isConfirmed) {
      errorMessageGenerator([
        { field: 'email', message: errorsConstants.email.checkEmail },
      ]);
    }

    const newCode = uuidv4();
    const newExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    }).toISOString();

    await this.usersSqlRepository.updateConfirmationCodeAndExpirationTime(
      user.id,
      newExpirationDate,
      newCode,
    );

    try {
      await emailTemplatesManager.resendEmailConfirmationMessage(
        user.email,
        newCode,
      );
    } catch (error) {
      console.log('resendEmailConfirmationMessage error', error);
    }

    return true;
  }
}
