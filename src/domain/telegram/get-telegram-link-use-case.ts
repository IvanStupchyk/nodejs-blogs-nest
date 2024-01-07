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
import { TelegramBotSubscriber } from '../../entities/telegram/Telegram-bot-subscriber.entity';
import { TelegramBotSubscribersRepository } from '../../infrastructure/repositories/telegram/telegram-bot-subscribers.repository';

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
    private readonly telegramBotSubscribersRepository: TelegramBotSubscribersRepository,
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

    let blogTelegramSubscriber =
      await this.telegramBotSubscribersRepository.findSubscriberByUserId(
        user.id,
      );

    const activationCode = randomUUID();

    if (!blogTelegramSubscriber) {
      blogTelegramSubscriber = new TelegramBotSubscriber();
      blogTelegramSubscriber.user = user;
    }

    blogTelegramSubscriber.activationCode = activationCode;

    await this.transactionsRepository.save(blogTelegramSubscriber, manager);

    console.log(
      'link',
      `${process.env.TELEGRAM_BOT_LINK}?start=${activationCode}`,
    );
    return {
      link: `${process.env.TELEGRAM_BOT_LINK}?start=${activationCode}`,
    };
  }

  async execute(command: GetTelegramLinkCommand) {
    return super.execute(command);
  }
}
