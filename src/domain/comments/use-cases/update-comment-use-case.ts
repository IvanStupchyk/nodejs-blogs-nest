import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { Comment } from '../../../entities/comments/Comment.entity';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { CommentsTransactionsRepository } from '../../../infrastructure/repositories/comments/comments-transactions.repository';

export class UpdateCommentCommand {
  constructor(
    public content: string,
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase extends TransactionUseCase<
  UpdateCommentCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly commentsTransactionsRepository: CommentsTransactionsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: UpdateCommentCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const comment =
      await this.commentsTransactionsRepository.fetchAllCommentDataById(
        id,
        manager,
      );
    Comment.update(comment, content, userId);

    await this.transactionsRepository.save(comment, manager);

    return HttpStatus.NO_CONTENT;
  }

  async execute(command: UpdateCommentCommand) {
    return super.execute(command);
  }
}
