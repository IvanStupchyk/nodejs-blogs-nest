import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { emailTemplatesManager } from '../../../infrastructure/email-templates-manager';
import { JwtService } from '../../../infrastructure/jwt.service';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';

export class SendRecoveryPasswordCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryPasswordCodeCommand)
export class SendRecoveryPasswordCodeUseCase
  implements ICommandHandler<SendRecoveryPasswordCodeCommand>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SendRecoveryPasswordCodeCommand): Promise<boolean> {
    const user = await this.usersSqlRepository.findUserByLoginOrEmail(
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
