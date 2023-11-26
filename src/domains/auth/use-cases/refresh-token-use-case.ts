import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { DevicesRepository } from '../../../infrastructure/repositories/devices.repository';
import { InvalidRefreshTokensRepository } from '../../../infrastructure/repositories/invalid-refresh-tokens.repository';
import { InvalidRefreshToken } from '../../../entities/users/invalid-refresh-tokens.entity';

export class RefreshTokenCommand {
  constructor(
    public userId: any,
    public deviceId: string,
    public oldRefreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
    private readonly invalidRefreshTokensRepository: InvalidRefreshTokensRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { userId, deviceId, oldRefreshToken } = command;

    const invalidRefreshTokens =
      await this.invalidRefreshTokensRepository.getAllInvalidRefreshTokens(
        userId,
      );

    const index = invalidRefreshTokens?.findIndex(
      (t) => t.refreshToken === oldRefreshToken,
    );

    if (index !== undefined && index > -1) {
      return null;
    }

    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      const device = await this.devicesRepository.findDeviceById(deviceId);

      device.lastActiveDate = new Date(result.iat * 1000);
      device.expirationDate = new Date(result.exp * 1000);
      await this.devicesRepository.save(device);

      const newInvalidRefreshToken = new InvalidRefreshToken();
      newInvalidRefreshToken.user = userId;
      newInvalidRefreshToken.refreshToken = oldRefreshToken;

      await this.invalidRefreshTokensRepository.save(newInvalidRefreshToken);
    } catch (error) {
      console.log(error);
    }

    return { accessToken, refreshToken };
  }
}
