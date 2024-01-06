import { CommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { BlogSubscribersRepository } from '../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { TransactionUseCase } from '../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../infrastructure/repositories/transactions/transactions.repository';

export class PopulateBlogSubscriberDataCommand {
  constructor(
    public message: string,
    public telegramId: number,
  ) {}
}

@CommandHandler(PopulateBlogSubscriberDataCommand)
export class PopulateBlogSubscriberDataUseCase extends TransactionUseCase<
  PopulateBlogSubscriberDataCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogSubscribersTransactionsRepository: BlogSubscribersRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: PopulateBlogSubscriberDataCommand,
    manager: EntityManager,
  ): Promise<void> {
    const isUserAlreadyRegistered =
      await this.blogSubscribersTransactionsRepository.findSubscriberByTelegramId(
        command.telegramId,
      );

    if (isUserAlreadyRegistered) {
      return null;
    }

    const activationCode = command.message?.split(' ')[1];

    const blogTelegramSubscriber =
      await this.blogSubscribersTransactionsRepository.findSubscriberByActivationCode(
        activationCode,
      );

    if (!blogTelegramSubscriber) {
      return null;
    }

    blogTelegramSubscriber.telegramId = command.telegramId;
    await this.transactionsRepository.save(blogTelegramSubscriber, manager);
  }

  async execute(command: PopulateBlogSubscriberDataCommand) {
    return super.execute(command);
  }
}
