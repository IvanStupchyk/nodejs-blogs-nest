import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

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
      if (user.expirationDate < new Date() || user.isConfirmed) {
        errorMessageGenerator([
          {
            field: 'code',
            message: errorsConstants.confirmCode.invalidCodeSecond,
          },
        ]);
      }

      user.isConfirmed = true;
      return await this.usersRepository.save(user);

      // return await this.usersRepository.confirmEmail(user.id);
    }
  }
}
