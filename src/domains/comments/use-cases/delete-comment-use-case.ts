import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<number> {
    const { commentId, userId } = command;

    if (!isUUID(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsRepository.fetchAllCommentDataById(commentId);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.user.id !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsRepository.deleteComment(commentId);

    return idDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
