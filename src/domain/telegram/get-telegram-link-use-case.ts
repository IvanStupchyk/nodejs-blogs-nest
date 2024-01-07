import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { UsersTransactionRepository } from '../../infrastructure/repositories/users/users.transaction.repository';
import { TransactionUseCase } from '../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../infrastructure/repositories/transactions/transactions.repository';
import * as process from 'process';
import { randomUUID } from 'crypto';
import { exceptionHandler } from '../../utils/errors/exception.handler';

export class GetTelegramLinkCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetTelegramLinkCommand)
export class GetTelegramLinkUseCase extends TransactionUseCase<
  GetTelegramLinkCommand,
  {
    link: string;
  } | void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: GetTelegramLinkCommand,
    manager: EntityManager,
  ): Promise<{
    link: string;
  } | void> {
    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      command.userId,
      manager,
    );

    if (!user) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const activationCode = randomUUID();

    user.activationBotCode = activationCode;
    await this.transactionsRepository.save(user, manager);

    return {
      link: `${process.env.TELEGRAM_BOT_LINK}?${
        process.env.TELEGRAM_ENV === 'local' ? 'start=' : 'code='
      }${activationCode}`,
    };
  }

  async execute(command: GetTelegramLinkCommand) {
    return super.execute(command);
  }
}
