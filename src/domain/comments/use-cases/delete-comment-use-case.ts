import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CommentsTransactionsRepository } from '../../../infrastructure/repositories/comments/comments-transactions.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase extends TransactionUseCase<
  DeleteCommentCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly commentsTransactionsRepository: CommentsTransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: DeleteCommentCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { commentId, userId } = command;

    if (!isUUID(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsTransactionsRepository.fetchAllCommentDataById(
        commentId,
        manager,
      );
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.user.id !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsTransactionsRepository.deleteComment(
      commentId,
      manager,
    );

    return idDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }

  async execute(command: DeleteCommentCommand) {
    return super.execute(command);
  }
}
