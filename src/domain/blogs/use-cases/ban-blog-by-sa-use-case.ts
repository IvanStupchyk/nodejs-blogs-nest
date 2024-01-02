import { CommandHandler } from '@nestjs/cqrs';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';
import { SaUserBanBlogInputDto } from '../../../application/dto/users/sa-user-ban-blog.input.dto';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { isUUID } from '../../../utils/utils';

export class BanBlogBySaCommand {
  constructor(
    public id: string,
    public body: SaUserBanBlogInputDto,
  ) {}
}

@CommandHandler(BanBlogBySaCommand)
export class BanBlogBySaUserCase extends TransactionUseCase<
  BanBlogBySaCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: BanBlogBySaCommand,
    manager: EntityManager,
  ): Promise<void> {
    if (!isUUID(command.id)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.id,
      manager,
    );

    if (!blog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    Blog.ban(blog, command.body.isBanned);
    await this.transactionsRepository.save(blog, manager);
  }

  async execute(command: BanBlogBySaCommand) {
    return super.execute(command);
  }
}
