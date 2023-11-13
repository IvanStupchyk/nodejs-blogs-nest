import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentsService } from '../comments.service';

export class UpdateCommentCommand {
  constructor(
    public content: string,
    public id: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<number> {
    const { id, currentUserId, content } = command;

    const foundComment =
      await this.commentsService.findCommentByIdWithoutLikeStatus(id);

    if (
      foundComment &&
      !new ObjectId(foundComment.commentatorInfo.userId).equals(currentUserId)
    ) {
      return HttpStatus.FORBIDDEN;
    }

    if (!ObjectId.isValid(id)) return HttpStatus.NOT_FOUND;
    const isCommentUpdated = await this.commentsRepository.updateComment(
      content,
      new ObjectId(id),
    );

    if (isCommentUpdated) return HttpStatus.NO_CONTENT;

    return HttpStatus.NOT_FOUND;
  }
}
