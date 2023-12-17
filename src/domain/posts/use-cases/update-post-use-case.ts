import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { UpdatePostInputDto } from '../../../application/dto/posts/update-post.input.dto';
import { HttpStatus } from '@nestjs/common';
import { Post } from '../../../entities/posts/Post.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts-transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';

export class UpdatePostWithCheckingCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
    public body: UpdatePostInputDto,
  ) {}
}

@CommandHandler(UpdatePostWithCheckingCommand)
export class UpdatePostUseCase extends TransactionUseCase<
  UpdatePostWithCheckingCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: UpdatePostWithCheckingCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { title, content, shortDescription } = command.body;

    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.blogId,
      manager,
    );
    const post = await this.postsTransactionsRepository.findPostById(
      command.postId,
      manager,
    );

    if (post) {
      Post.update(blog, post, title, content, shortDescription, command.userId);

      await this.transactionsRepository.save(post, manager);

      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }

  async execute(command: UpdatePostWithCheckingCommand) {
    return super.execute(command);
  }
}
