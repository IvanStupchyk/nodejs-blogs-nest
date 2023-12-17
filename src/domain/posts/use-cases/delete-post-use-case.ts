import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts-transactions.repository';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs-transactions.repository';

export class DeletePostWithCheckingCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostWithCheckingCommand)
export class DeletePostUseCase extends TransactionUseCase<
  DeletePostWithCheckingCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly blogsTransactionsRepository: BlogsTransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: DeletePostWithCheckingCommand,
    manager: EntityManager,
  ): Promise<number> {
    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsTransactionsRepository.findBlogById(
      command.blogId,
      manager,
    );
    if (!blog) return HttpStatus.NOT_FOUND;
    if (blog && blog.user && blog.user.id !== command.userId)
      return HttpStatus.FORBIDDEN;

    const result = await this.postsTransactionsRepository.deletePost(
      command.postId,
      manager,
    );

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }

  async execute(command: DeletePostWithCheckingCommand) {
    return super.execute(command);
  }
}
