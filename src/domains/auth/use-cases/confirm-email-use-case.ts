import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCode(
      command.code,
    );

    if (!user) {
      errorMessageGenerator([
        {
          field: 'code',
          message: errorsConstants.confirmCode.invalidCodeFirst,
        },
      ]);
    } else {
      if (
        !user.canBeConfirmed(command.code) ||
        user.emailConfirmation.isConfirmed
      ) {
        errorMessageGenerator([
          {
            field: 'code',
            message: errorsConstants.confirmCode.invalidCodeSecond,
          },
        ]);
      }

      user.confirm(command.code);
      return !!(await this.usersRepository.save(user));
    }
  }
}
