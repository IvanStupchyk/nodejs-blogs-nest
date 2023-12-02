import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../../entities/devices/Device.entity';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class LogInUserCommand {
  constructor(
    public userAgent: string,
    public userId: string,
    public ip: string,
  ) {}
}

@CommandHandler(LogInUserCommand)
export class LogInUserUseCase implements ICommandHandler<LogInUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    command: LogInUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, userAgent, ip } = command;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user.isConfirmed) return null;

    const deviceId = uuidv4();
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    const newDevice = await this._createDevice(
      userAgent,
      deviceId,
      userId,
      refreshToken,
      ip,
    );

    await this.dataSourceRepository.save(newDevice);
    return { accessToken, refreshToken };
  }

  private async _createDevice(
    userAgent: string,
    deviceId: string,
    userId: any,
    refreshToken: string,
    ip: string,
  ) {
    const result: any = await this.jwtService.verifyRefreshToken(refreshToken);

    const newDevice = new Device();
    newDevice.deviceId = deviceId;
    newDevice.title = userAgent;
    newDevice.ip = ip;
    newDevice.user = userId;
    newDevice.lastActiveDate = new Date(result.iat * 1000);
    newDevice.expirationDate = new Date(result.exp * 1000);

    return newDevice;
  }
}
