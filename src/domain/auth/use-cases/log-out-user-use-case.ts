import { CommandHandler } from '@nestjs/cqrs';
import { Request } from 'express';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { DevicesTransactionsRepository } from '../../../infrastructure/repositories/devices/devices-transactions.repository';
import { InvalidRefreshTokensTransactionsRepository } from '../../../infrastructure/repositories/users/invalid-refresh-tokens-transactions.repository';
import { JwtService } from '@nestjs/jwt';

export class LogOutUserCommand {
  constructor(public req: Request) {}
}

@CommandHandler(LogOutUserCommand)
export class LogOutUserUseCase extends TransactionUseCase<
  LogOutUserCommand,
  boolean
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly devicesTransactionsRepository: DevicesTransactionsRepository,
    private readonly invalidRefreshTokensTransactionsRepository: InvalidRefreshTokensTransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: LogOutUserCommand,
    manager: EntityManager,
  ): Promise<boolean> {
    const { req } = command;

    if (!req.cookies?.refreshToken) return false;

    try {
      const result: any = this.jwtService.decode(req.cookies.refreshToken);

      if (!result?.userId) return false;

      const invalidRefreshTokens =
        await this.invalidRefreshTokensTransactionsRepository.getAllInvalidRefreshTokens(
          result?.userId,
          manager,
        );

      const index = invalidRefreshTokens?.findIndex(
        (t) => t.refreshToken === req.cookies?.refreshToken,
      );

      if (index !== undefined && index > -1) {
        return false;
      }

      const session = await this.devicesTransactionsRepository.findDeviceById(
        result?.deviceId,
        manager,
      );
      if (!session) return false;

      return await this.devicesTransactionsRepository.removeSpecifiedSession(
        result.userId,
        result.deviceId,
        manager,
      );
    } catch (error) {
      return false;
    }
  }

  async execute(command: LogOutUserCommand) {
    return super.execute(command);
  }
}
