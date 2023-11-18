import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Request } from 'express';
import { DevicesSqlRepository } from '../../../infrastructure/repositories-raw-sql/devices-sql.repository';
import { InvalidRefreshTokensSqlRepository } from '../../../infrastructure/repositories-raw-sql/invalid-refresh-tokens-sql.repository';

export class LogOutUserCommand {
  constructor(public req: Request) {}
}

@CommandHandler(LogOutUserCommand)
export class LogOutUserUseCase implements ICommandHandler<LogOutUserCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly devicesSqlRepository: DevicesSqlRepository,
    private readonly invalidRefreshTokensSqlRepository: InvalidRefreshTokensSqlRepository,
  ) {}

  async execute(command: LogOutUserCommand): Promise<boolean> {
    const { req } = command;

    if (!req.cookies?.refreshToken) return false;

    try {
      const result: any = await this.jwtService.verifyRefreshToken(
        req.cookies.refreshToken,
      );
      if (!result?.userId) return false;

      const invalidRefreshTokens =
        await this.invalidRefreshTokensSqlRepository.getAllInvalidRefreshTokens(
          result?.userId,
        );

      const index = invalidRefreshTokens?.findIndex(
        (t) => t.refreshToken === req.cookies?.refreshToken,
      );

      if (index !== undefined && index > -1) {
        return false;
      }

      const session = await this.devicesSqlRepository.findDeviceById(
        result?.deviceId,
      );
      if (!session) return false;

      return await this.devicesSqlRepository.removeSpecifiedSession(
        result.userId,
        result.deviceId,
      );
    } catch (error) {
      return false;
    }
  }
}
