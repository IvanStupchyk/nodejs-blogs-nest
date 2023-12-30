import { CommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { isUUID } from '../../../utils/utils';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { UserBanByBloggerInputDto } from '../../../application/dto/blogs/user-ban-by-blogger.input.dto';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';

export class BanUserByBloggerCommand {
  constructor(
    public id: string,
    public banInfo: UserBanByBloggerInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(BanUserByBloggerCommand)
export class BanUserByBloggerUseCase extends TransactionUseCase<
  BanUserByBloggerCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    protected readonly usersTransactionRepository: UsersTransactionRepository,
    protected readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: BanUserByBloggerCommand,
    manager: EntityManager,
  ): Promise<void> {
    const { id, banInfo, userId } = command;

    if (!isUUID(id)) {
      exceptionHandler(HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersTransactionRepository.findUserToBanById(
      id,
      manager,
    );

    if (!user) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      banInfo.blogId,
      manager,
    );

    if (!blog) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (blog.user.id !== userId) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    if (banInfo.isBanned) {
      user.userBanByBlogger.isBanned = true;
      user.userBanByBlogger.banDate = new Date();
      user.userBanByBlogger.banReason = banInfo.banReason;
      user.userBanByBlogger.blog = blog;
    } else {
      user.userBanByBlogger.isBanned = false;
      user.userBanByBlogger.banDate = null;
      user.userBanByBlogger.banReason = null;
      user.userBanByBlogger.blog = null;
    }

    await this.transactionsRepository.save(user.userBanByBlogger, manager);
  }

  async execute(command: BanUserByBloggerCommand) {
    return super.execute(command);
  }
}
