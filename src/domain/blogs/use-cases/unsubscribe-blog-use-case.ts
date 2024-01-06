import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { BlogSubscribersRepository } from '../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { SubscriptionStatus } from '../../../constants/subscription-status.enum';

export class UnsubscribeBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UnsubscribeBlogCommand)
export class UnsubscribeBlogUseCase extends TransactionUseCase<
  UnsubscribeBlogCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: UnsubscribeBlogCommand,
    manager: EntityManager,
  ): Promise<void> {
    const { blogId, userId } = command;

    if (!isUUID(command.blogId)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      blogId,
      manager,
    );

    if (!blog) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const user = await this.usersRepository.fetchAllUserDataById(userId);

    if (!user) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const subscriber =
      await this.blogSubscribersRepository.findSubscriberByUserIdAndBlogId(
        userId,
        blogId,
      );

    if (!subscriber) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    subscriber.blogs = subscriber.blogs.filter((b) => b !== blog);
    subscriber.subscriptionStatus = SubscriptionStatus.Unsubscribed;

    await this.transactionsRepository.save(subscriber, manager);
  }

  async execute(command: UnsubscribeBlogCommand) {
    return super.execute(command);
  }
}
