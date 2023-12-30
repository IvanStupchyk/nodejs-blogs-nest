import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { CommentViewType } from '../../../types/comments.types';
import { Comment } from '../../../entities/comments/Comment.entity';
import { likeStatus } from '../../../types/general.types';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts-transactions.repository';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';

export class CreateCommentCommand {
  constructor(
    public content: string,
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase extends TransactionUseCase<
  CreateCommentCommand,
  CommentViewType | null
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: CreateCommentCommand,
    manager: EntityManager,
  ): Promise<CommentViewType | null> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return null;

    const foundPost = await this.postsTransactionsRepository.findPostById(
      id,
      manager,
    );
    if (!foundPost) return null;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      userId,
      manager,
    );
    if (!user) return null;

    if (
      user.userBanByBlogger.isBanned &&
      foundPost.blog &&
      foundPost.blog.id === user.userBanByBlogger.blog?.id
    ) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const newComment = Comment.create(content, user, foundPost);

    const savedComment = await this.transactionsRepository.save(
      newComment,
      manager,
    );

    return {
      id: savedComment.id,
      content: savedComment.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: savedComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      },
    };
  }

  async execute(command: CreateCommentCommand) {
    return super.execute(command);
  }
}
