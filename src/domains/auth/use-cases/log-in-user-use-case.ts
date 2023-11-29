import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Request } from 'express';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { DevicesRepository } from '../../../infrastructure/repositories/devices.repository';
import { Device } from '../../../entities/devices/Device.entity';

export class LogInUserCommand {
  constructor(
    public req: Request,
    public userId: string,
  ) {}
}

@CommandHandler(LogInUserCommand)
export class LogInUserUseCase implements ICommandHandler<LogInUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  async execute(
    command: LogInUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, req } = command;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user.isConfirmed) return null;

    const deviceId = uuidv4();
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    const newDevice = await this._createDevice(
      req,
      deviceId,
      userId,
      refreshToken,
    );

    await this.devicesRepository.save(newDevice);
    return { accessToken, refreshToken };
  }

  private async _createDevice(
    req: Request,
    deviceId: string,
    userId: any,
    refreshToken: string,
  ) {
    const newDevice = new Device();
    newDevice.deviceId = deviceId;
    newDevice.title = req.headers['user-agent'] ?? 'unknown';
    newDevice.ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket.remoteAddress ?? '');
    newDevice.user = userId;

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      newDevice.lastActiveDate = new Date(result.iat * 1000);
      newDevice.expirationDate = new Date(result.exp * 1000);
    } catch (error) {
      console.log(error);
    }

    return newDevice;
  }
}
