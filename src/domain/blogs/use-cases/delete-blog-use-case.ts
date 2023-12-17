import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase extends TransactionUseCase<
  DeleteBlogCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: DeleteBlogCommand,
    manager: EntityManager,
  ): Promise<number> {
    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.id,
      manager,
    );
    if (blog && blog.user && blog.user.id !== command.userId)
      return HttpStatus.FORBIDDEN;

    const result = await this.blogsTransactionsRepository.deleteBlog(
      command.id,
      manager,
    );

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }

  async execute(command: DeleteBlogCommand) {
    return super.execute(command);
  }
}
