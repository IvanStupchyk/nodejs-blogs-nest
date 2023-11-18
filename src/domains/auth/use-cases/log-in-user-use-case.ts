import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Request } from 'express';
import { AuthService } from '../../../application/auth.service';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';
import { v4 as uuidv4 } from 'uuid';
import { DevicesSqlRepository } from '../../../infrastructure/repositories-raw-sql/devices-sql.repository';

export class LogInUserCommand {
  constructor(
    public req: Request,
    public userId: string,
  ) {}
}

@CommandHandler(LogInUserCommand)
export class LogInUserUseCase implements ICommandHandler<LogInUserCommand> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly jwtService: JwtService,
    private readonly devicesSqlRepository: DevicesSqlRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: LogInUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, req } = command;

    const user = await this.usersSqlRepository.fetchAllUserDataById(userId);
    if (!user.isConfirmed) return null;

    const deviceId = uuidv4();
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    const newDevice = await this.authService._createDevice(
      req,
      deviceId,
      userId,
      refreshToken,
    );
    await this.devicesSqlRepository.setNewDevice(newDevice);
    return { accessToken, refreshToken };
  }
}
