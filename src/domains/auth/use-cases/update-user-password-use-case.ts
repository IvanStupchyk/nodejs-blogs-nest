import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import bcrypt from 'bcrypt';
import { JwtService } from '../../../infrastructure/jwt.service';
import { NewPasswordDto } from '../models/new-password.dto';

export class UpdateUserPasswordCommand {
  constructor(public body: NewPasswordDto) {}
}

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordUseCase
  implements ICommandHandler<UpdateUserPasswordCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: UpdateUserPasswordCommand): Promise<boolean> {
    const { newPassword, recoveryCode } = command.body;

    const result: any =
      await this.jwtService.verifyPasswordRecoveryCode(recoveryCode);
    if (!result) {
      errorMessageGenerator([
        {
          field: 'recoveryCode',
          message: errorsConstants.recoveryCode.recoveryCodeFirst,
        },
      ]);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const user = await this.usersRepository.fetchAllUserDataById(result.userId);
    if (!user) {
      errorMessageGenerator([
        {
          field: 'recoveryCode',
          message: errorsConstants.recoveryCode.recoveryCodeSecond,
        },
      ]);
    }

    user.changeUserPassword(newPasswordHash);

    return !!(await this.usersRepository.save(user));
  }
}