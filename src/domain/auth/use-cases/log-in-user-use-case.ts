import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../../entities/devices/Device.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { JwtService } from '@nestjs/jwt';
import { settings } from '../../../constants/settings';

export class LogInUserCommand {
  constructor(
    public userAgent: string,
    public userId: string,
    public ip: string,
  ) {}
}

@CommandHandler(LogInUserCommand)
export class LogInUserUseCase extends TransactionUseCase<
  LogInUserCommand,
  { accessToken: string; refreshToken: string }
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly jwtService: JwtService,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: LogInUserCommand,
    manager: EntityManager,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, userAgent, ip } = command;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      userId,
      manager,
    );
    if (!user.isConfirmed) return null;

    const deviceId = uuidv4();

    const accessTokenPayload = { userId: userId };
    const refreshTokenPayload = {
      userId: userId,
      deviceId: deviceId,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: settings.JWT_ACCESS_SECRET,
      expiresIn: 100000,
    });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: settings.JWT_REFRESH_SECRET,
      expiresIn: 200000,
    });

    const newDevice = await this._createDevice(
      userAgent,
      deviceId,
      userId,
      refreshToken,
      ip,
    );

    await this.transactionsRepository.save(newDevice, manager);
    return { accessToken, refreshToken };
  }

  async execute(command: LogInUserCommand) {
    return super.execute(command);
  }

  private async _createDevice(
    userAgent: string,
    deviceId: string,
    userId: any,
    refreshToken: string,
    ip: string,
  ) {
    const result: any = this.jwtService.decode(refreshToken);

    return Device.create(
      deviceId,
      userAgent,
      ip,
      userId,
      result.iat,
      result.exp,
    );
  }
}
