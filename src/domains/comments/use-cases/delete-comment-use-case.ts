import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { CommentsSqlRepository } from '../../../infrastructure/repositories-raw-sql/comments-sql.repository';
import { CommentLikesSqlRepository } from '../../../infrastructure/repositories-raw-sql/comment-likes-sql.repository';

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
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly commentLikesSqlRepository: CommentLikesSqlRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<number> {
    const { commentId, userId } = command;

    if (!isUUID(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsSqlRepository.findCommentById(commentId);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.commentatorInfo.userId !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsSqlRepository.deleteComment(commentId);

    if (idDeleted) {
      await this.commentLikesSqlRepository.deleteAllCommentLikesAndDislikes(
        commentId,
      );
      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }
}
