import { HttpStatus } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { PostLike } from '../../../entities/posts/Post-like.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts-transactions.repository';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { PostLikesTransactionsRepository } from '../../../infrastructure/repositories/posts/post-likes-transactions.repository';

export class ChangePostLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: string,
  ) {}
}

@CommandHandler(ChangePostLikesCountCommand)
export class ChangePostLikesCountUseCase extends TransactionUseCase<
  ChangePostLikesCountCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly postLikesTransactionsRepository: PostLikesTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: ChangePostLikesCountCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { id, myStatus, userId } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundPost = await this.postsTransactionsRepository.findPostById(
      id,
      manager,
    );
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      userId,
      manager,
    );
    if (!user) return HttpStatus.NOT_FOUND;

    const userPostLike =
      await this.postLikesTransactionsRepository.findPostLikesByUserIdAndPostId(
        userId,
        id,
        manager,
      );

    if (
      userPostLike?.likeStatus === myStatus ||
      (!userPostLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    let likeStatement;

    if (userPostLike) {
      likeStatement = userPostLike;
    } else {
      likeStatement = PostLike.create();
    }

    PostLike.update(likeStatement, myStatus, foundPost, user);

    await this.transactionsRepository.save(likeStatement, manager);

    return HttpStatus.NO_CONTENT;
  }

  async execute(command: ChangePostLikesCountCommand) {
    return super.execute(command);
  }
}
