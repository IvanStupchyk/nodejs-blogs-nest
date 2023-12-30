import { CommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { isUUID } from '../../../utils/utils';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';
import { BanUsersQueryDto } from '../../../application/dto/blogs/ban-users.query.dto';
import { UsersQueryRepository } from '../../../infrastructure/repositories/users/users-query.repository';
import { BannedUsersForBlogViewType } from '../../../types/users.types';

export class FindBanUsersByBloggerCommand {
  constructor(
    public id: string,
    public query: BanUsersQueryDto,
    public userId: string,
  ) {}
}

@CommandHandler(FindBanUsersByBloggerCommand)
export class FindBanUsersByBloggerUseCase extends TransactionUseCase<
  FindBanUsersByBloggerCommand,
  BannedUsersForBlogViewType
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    protected readonly usersTransactionRepository: UsersTransactionRepository,
    protected readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: FindBanUsersByBloggerCommand,
    manager: EntityManager,
  ): Promise<BannedUsersForBlogViewType> {
    const { id, query, userId } = command;

    if (!isUUID(id)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      id,
      manager,
    );

    if (!blog) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (blog.user.id !== userId) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    return await this.usersQueryRepository.getSortedBannedUserForSpecifiedBlog(
      id,
      query,
    );
  }

  async execute(command: FindBanUsersByBloggerCommand) {
    return super.execute(command);
  }
}
