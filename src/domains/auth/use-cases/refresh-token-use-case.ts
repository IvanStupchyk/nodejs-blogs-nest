import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { DevicesSqlRepository } from '../../../infrastructure/repositories-raw-sql/devices-sql.repository';
import { InvalidRefreshTokensSqlRepository } from '../../../infrastructure/repositories-raw-sql/invalid-refresh-tokens-sql.repository';
import { InvalidRefreshTokenType } from '../../../types/rawSqlTypes/generalTypes';
import { v4 as uuidv4 } from 'uuid';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public oldRefreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly devicesSqlRepository: DevicesSqlRepository,
    private readonly jwtService: JwtService,
    private readonly invalidRefreshTokensSqlRepository: InvalidRefreshTokensSqlRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { userId, deviceId, oldRefreshToken } = command;

    const invalidRefreshTokens =
      await this.invalidRefreshTokensSqlRepository.getAllInvalidRefreshTokens(
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
      const lastActiveDate = new Date(result.iat * 1000).toISOString();
      const expirationDate = new Date(result.exp * 1000).toISOString();

      await this.devicesSqlRepository.updateExistingSession(
        deviceId,
        lastActiveDate,
        expirationDate,
      );

      const newInvalidRefreshToken: InvalidRefreshTokenType = {
        id: uuidv4(),
        userId,
        refreshToken: oldRefreshToken,
        createdAt: new Date().toISOString(),
      };
      await this.invalidRefreshTokensSqlRepository.addInvalidRefreshTokens(
        newInvalidRefreshToken,
      );
    } catch (error) {
      console.log(error);
    }

    return { accessToken, refreshToken };
  }
}
