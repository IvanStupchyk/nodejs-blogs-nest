import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../application/dto/blogs/blog.input.dto';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogViewType } from '../../../types/blogs.types';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';

export class CreateBlogCommand {
  constructor(
    public userId: string,
    public body: BlogInputDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase extends TransactionUseCase<
  CreateBlogCommand,
  BlogViewType
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private eventBus: EventBus,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: CreateBlogCommand,
    manager: EntityManager,
  ): Promise<BlogViewType> {
    const { name, websiteUrl, description } = command.body;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      command.userId,
      manager,
    );

    const newBlog = Blog.create(name, description, websiteUrl, user);
    const savedBlog = await this.transactionsRepository.save(newBlog, manager);

    newBlog.getUncommittedEvents().forEach((e) => this.eventBus.publish(e));
    return {
      id: savedBlog.id,
      name: savedBlog.name,
      description: savedBlog.description,
      websiteUrl: savedBlog.websiteUrl,
      createdAt: savedBlog.createdAt,
      isMembership: savedBlog.isMembership,
    };
  }

  async execute(command: CreateBlogCommand) {
    return super.execute(command);
  }
}
