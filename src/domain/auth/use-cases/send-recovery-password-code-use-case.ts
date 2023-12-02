import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { JwtService } from '../../../infrastructure/jwt.service';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';

export class SendRecoveryPasswordCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryPasswordCodeCommand)
export class SendRecoveryPasswordCodeUseCase
  implements ICommandHandler<SendRecoveryPasswordCodeCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SendRecoveryPasswordCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    );

    if (user) {
      try {
        const recoveryCode = await this.jwtService.createPasswordRecoveryJWT(
          user.id,
        );

        await emailTemplatesManager.sendPasswordRecoveryMessage(
          user,
          recoveryCode,
        );
      } catch (error) {
        console.log('sendPasswordRecoveryMessage error', error);
      }
    }
    return true;
  }
}
