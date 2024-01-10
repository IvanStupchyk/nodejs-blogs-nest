import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { settings } from '../../../constants/settings';

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
        const codePayload = {
          userId: user.id,
        };

        const recoveryCode = this.jwtService.sign(codePayload, {
          secret: settings.JWT_PASSWORD_RECOVERY,
          expiresIn: '2h',
        });

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
