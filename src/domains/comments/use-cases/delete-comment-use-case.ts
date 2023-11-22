import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentLikesRepository } from '../../../infrastructure/repositories/comment-likes.repository';

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
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<number> {
    const { commentId, userId } = command;

    if (!isUUID(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsRepository.findCommentById(commentId);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.commentatorInfo.userId !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsRepository.deleteComment(commentId);

    if (idDeleted) {
      await this.commentLikesRepository.deleteAllCommentLikesAndDislikes(
        commentId,
      );
      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }
}
