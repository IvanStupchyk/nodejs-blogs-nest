import { CommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UserBanDto } from '../../../application/dto/users/user-ban.input.dto';
import { isUUID } from '../../../utils/utils';
import { exceptionHandler } from '../../../exception.handler';
import { HttpStatus } from '@nestjs/common';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { DevicesTransactionsRepository } from '../../../infrastructure/repositories/devices/devices-transactions.repository';

export class BanUserCommand {
  constructor(
    public id: string,
    public banInfo: UserBanDto,
  ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase extends TransactionUseCase<BanUserCommand, void> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    protected readonly usersTransactionRepository: UsersTransactionRepository,
    protected readonly devicesTransactionsRepository: DevicesTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: BanUserCommand,
    manager: EntityManager,
  ): Promise<void> {
    const { id, banInfo } = command;

    if (!isUUID(id)) {
      exceptionHandler(HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersTransactionRepository.findUserToBanById(
      id,
      manager,
    );

    if (!user) {
      errorMessageGenerator([{ field: 'id', message: 'user not found' }]);
    }

    if (banInfo.isBanned) {
      user.userBanInfo.isBanned = true;
      user.userBanInfo.banDate = new Date();
      user.userBanInfo.banReason = banInfo.banReason;

      await this.devicesTransactionsRepository.removeAllUserSessions(
        user.id,
        manager,
      );
    } else {
      user.userBanInfo.isBanned = false;
      user.userBanInfo.banDate = null;
      user.userBanInfo.banReason = null;
    }

    await this.transactionsRepository.save(user.userBanInfo, manager);
  }

  async execute(command: BanUserCommand) {
    return super.execute(command);
  }
}
