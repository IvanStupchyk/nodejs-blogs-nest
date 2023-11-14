import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { JwtService } from '../../../infrastructure/jwt.service';
import { ObjectId } from 'mongodb';
import { Request } from 'express';
import { DevicesRepository } from '../../../infrastructure/repositories/devices.repository';
import { AuthService } from '../../../application/auth.service';

export class LogInUserCommand {
  constructor(
    public req: Request,
    public userId: ObjectId,
  ) {}
}

@CommandHandler(LogInUserCommand)
export class LogInUserUseCase implements ICommandHandler<LogInUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: LogInUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, req } = command;

    const user = await this.usersRepository.fetchAllUserDataById(
      new ObjectId(userId),
    );
    if (!user.emailConfirmation.isConfirmed) return null;

    const deviceId = new ObjectId();
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    const newDevice = await this.authService._createRefreshTokenDeviceModel(
      req,
      deviceId,
      userId,
      refreshToken,
    );
    await this.devicesRepository.setNewDevice(newDevice);
    return { accessToken, refreshToken };
  }
}
