import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments/comments.repository';
import { isUUID } from '../../../utils/utils';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class UpdateCommentCommand {
  constructor(
    public content: string,
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const comment = await this.commentsRepository.fetchAllCommentDataById(id);
    if (!comment) return HttpStatus.NOT_FOUND;

    if (comment && comment.user.id !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    comment.content = content;
    const isCommentUpdated = await this.dataSourceRepository.save(comment);

    if (isCommentUpdated) return HttpStatus.NO_CONTENT;

    return HttpStatus.NOT_FOUND;
  }
}
