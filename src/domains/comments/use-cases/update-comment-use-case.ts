import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { isUUID } from '../../../utils/utils';

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
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundComment = await this.commentsRepository.findCommentById(id);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.commentatorInfo.userId !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const isCommentUpdated = await this.commentsRepository.updateComment(
      content,
      id,
    );

    if (isCommentUpdated) return HttpStatus.NO_CONTENT;

    return HttpStatus.NOT_FOUND;
  }
}
