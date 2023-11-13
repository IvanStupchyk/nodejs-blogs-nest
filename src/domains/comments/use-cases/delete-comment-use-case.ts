import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentsService } from '../comments.service';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public currentUserId: ObjectId,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<number> {
    const { commentId, currentUserId } = command;

    if (!ObjectId.isValid(commentId)) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsService.findCommentByIdWithoutLikeStatus(commentId);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (
      foundComment &&
      !new ObjectId(foundComment.commentatorInfo.userId).equals(currentUserId)
    ) {
      return HttpStatus.FORBIDDEN;
    }

    const idDeleted = await this.commentsRepository.deleteComment(commentId);

    if (idDeleted) {
      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }
}
