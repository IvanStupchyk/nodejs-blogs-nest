import { CommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { InvalidRefreshToken } from '../../../entities/users/Invalid-refresh-tokens.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { InvalidRefreshTokensTransactionsRepository } from '../../../infrastructure/repositories/users/invalid-refresh-tokens-transactions.repository';
import { DevicesTransactionsRepository } from '../../../infrastructure/repositories/devices/devices-transactions.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: any,
    public deviceId: string,
    public oldRefreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase extends TransactionUseCase<
  RefreshTokenCommand,
  { accessToken: string; refreshToken: string } | null
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly devicesTransactionsRepository: DevicesTransactionsRepository,
    private readonly invalidRefreshTokensTransactionsRepository: InvalidRefreshTokensTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: RefreshTokenCommand,
    manager: EntityManager,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { userId, deviceId, oldRefreshToken } = command;

    const invalidRefreshTokens =
      await this.invalidRefreshTokensTransactionsRepository.getAllInvalidRefreshTokens(
        userId,
        manager,
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
      const device = await this.devicesTransactionsRepository.findDeviceById(
        deviceId,
        manager,
      );

      device.lastActiveDate = new Date(result.iat * 1000);
      device.expirationDate = new Date(result.exp * 1000);
      await this.transactionsRepository.save(device, manager);

      const newInvalidRefreshToken = new InvalidRefreshToken();
      newInvalidRefreshToken.user = userId;
      newInvalidRefreshToken.refreshToken = oldRefreshToken;

      await this.transactionsRepository.save(newInvalidRefreshToken, manager);
    } catch (error) {
      console.log(error);
    }

    return { accessToken, refreshToken };
  }

  async execute(command: RefreshTokenCommand) {
    return super.execute(command);
  }
}
