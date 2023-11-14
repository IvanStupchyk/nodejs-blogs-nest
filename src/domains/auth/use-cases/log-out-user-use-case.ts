import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Request } from 'express';
import { DevicesRepository } from '../../../infrastructure/repositories/devices.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class LogOutUserCommand {
  constructor(public req: Request) {}
}

@CommandHandler(LogOutUserCommand)
export class LogOutUserUseCase implements ICommandHandler<LogOutUserCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: LogOutUserCommand): Promise<boolean> {
    const { req } = command;

    if (!req.cookies?.refreshToken) return false;

    try {
      const result: any = await this.jwtService.verifyRefreshToken(
        req.cookies.refreshToken,
      );
      if (!result?.userId) return false;

      const user = await this.usersRepository.fetchAllUserDataById(
        result?.userId,
      );

      if (user.isRefreshTokenInvalid(req.cookies?.refreshToken)) {
        return false;
      }

      const session = await this.devicesRepository.findDeviceById(
        result?.deviceId,
      );
      if (!session) return false;

      return await this.devicesRepository.removeSpecifiedSession(
        result.userId,
        result.deviceId,
      );
    } catch (error) {
      return false;
    }
  }
}
