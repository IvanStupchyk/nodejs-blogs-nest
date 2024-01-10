import { HttpStatus } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { Request } from 'express';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { DevicesTransactionsRepository } from '../../../infrastructure/repositories/devices/devices-transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { JwtService } from '@nestjs/jwt';

export class DeleteDeviceCommand {
  constructor(
    public req: Request,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase extends TransactionUseCase<
  DeleteDeviceCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly devicesTransactionsRepository: DevicesTransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: DeleteDeviceCommand,
    manager: EntityManager,
  ): Promise<number> {
    if (!command.req.cookies.refreshToken) return HttpStatus.UNAUTHORIZED;
    if (!command.deviceId) return HttpStatus.NOT_FOUND;

    const result: any = this.jwtService.decode(
      command.req.cookies.refreshToken,
    );
    if (!result?.userId) return HttpStatus.UNAUTHORIZED;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      result.userId,
      manager,
    );
    if (!user) return HttpStatus.UNAUTHORIZED;

    const isUuid = isUUID(command.deviceId);
    if (!isUuid) return HttpStatus.NOT_FOUND;

    const isDeviceIdExist =
      await this.devicesTransactionsRepository.findDeviceById(
        command.deviceId,
        manager,
      );

    if (!isDeviceIdExist) return HttpStatus.NOT_FOUND;
    if (result.deviceId === command.deviceId) return HttpStatus.FORBIDDEN;

    const isDeleted =
      await this.devicesTransactionsRepository.removeSpecifiedSession(
        result.userId,
        command.deviceId,
        manager,
      );

    if (!isDeleted) return HttpStatus.FORBIDDEN;
    return HttpStatus.NO_CONTENT;
  }

  async execute(command: DeleteDeviceCommand) {
    return super.execute(command);
  }
}
