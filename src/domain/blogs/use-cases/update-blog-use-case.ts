import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../application/dto/blogs/blog.input.dto';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';

export class UpdateBlogCommand {
  constructor(
    public body: BlogInputDto,
    public userId: string,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase extends TransactionUseCase<
  UpdateBlogCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private eventBus: EventBus,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: UpdateBlogCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { name, websiteUrl, description } = command.body;

    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.id,
      manager,
    );
    Blog.update(blog, description, websiteUrl, name, command.userId);

    await this.transactionsRepository.save(blog, manager);

    blog.getUncommittedEvents().forEach((e) => this.eventBus.publish(e));

    return HttpStatus.NO_CONTENT;
  }

  async execute(command: UpdateBlogCommand) {
    return super.execute(command);
  }
}
