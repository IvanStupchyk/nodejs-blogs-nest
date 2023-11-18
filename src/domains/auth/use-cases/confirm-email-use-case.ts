import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersSqlRepository.findUserByConfirmationCode(
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

      return await this.usersSqlRepository.confirmEmail(user.id);
    }

    //   user.confirm(command.code);
    //   return !!(await this.usersRepository.save(user));
    // }
  }
}
