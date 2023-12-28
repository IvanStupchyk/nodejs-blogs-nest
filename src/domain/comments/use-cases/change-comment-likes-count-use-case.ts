import { CommandHandler } from "@nestjs/cqrs";
import { likeStatus } from "../../../types/general.types";
import { errorMessageGenerator } from "../../../utils/errors/error-message-generator";
import { errorsConstants } from "../../../constants/errors.contants";
import { isUUID } from "../../../utils/utils";
import { HttpStatus } from "@nestjs/common";
import { CommentLike } from "../../../entities/comments/Comment-like.entity";
import { TransactionUseCase } from "../../transaction/use-case/transaction-use-case";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";
import {
  CommentsTransactionsRepository
} from "../../../infrastructure/repositories/comments/comments-transactions.repository";
import { TransactionsRepository } from "../../../infrastructure/repositories/transactions/transactions.repository";
import { UsersTransactionRepository } from "../../../infrastructure/repositories/users/users.transaction.repository";
import {
  CommentLikesTransactionsRepository
} from "../../../infrastructure/repositories/comments/comment-likes-transactions.repository";

export class ChangeCommentLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: string,
  ) {}
}

@CommandHandler(ChangeCommentLikesCountCommand)
export class ChangeCommentLikesCountUseCase extends TransactionUseCase<
  ChangeCommentLikesCountCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly commentsTransactionsRepository: CommentsTransactionsRepository,
    private readonly commentLikesTransactionsRepository: CommentLikesTransactionsRepository,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: ChangeCommentLikesCountCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { id, userId, myStatus } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      userId,
      manager,
    );
    if (!user) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsTransactionsRepository.fetchAllCommentDataById(
        id,
        manager,
      );
    if (!foundComment) return HttpStatus.NOT_FOUND;

    const userCommentLike =
      await this.commentLikesTransactionsRepository.findCommentLikesByUserIdAndCommentId(
        userId,
        id,
        manager,
      );

    if (
      userCommentLike?.likeStatus === myStatus ||
      (!userCommentLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    let likeStatement;

    if (userCommentLike) {
      likeStatement = userCommentLike;
    } else {
      likeStatement = CommentLike.create();
    }

    CommentLike.update(likeStatement, myStatus, user, foundComment);

    await this.transactionsRepository.save(likeStatement, manager);

    return HttpStatus.NO_CONTENT;
  }

  async execute(command: ChangeCommentLikesCountCommand) {
    return super.execute(command);
  }
}
