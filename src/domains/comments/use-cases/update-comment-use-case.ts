import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CommentsSqlRepository } from '../../../infrastructure/repositories-raw-sql/comments-sql.repository';
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
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: UpdateCommentCommand): Promise<number> {
    const { id, userId, content } = command;
    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundComment = await this.commentsSqlRepository.findCommentById(id);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    if (foundComment && foundComment.commentatorInfo.userId !== userId) {
      return HttpStatus.FORBIDDEN;
    }

    const isCommentUpdated = await this.commentsSqlRepository.updateComment(
      content,
      id,
    );

    if (isCommentUpdated) return HttpStatus.NO_CONTENT;

    return HttpStatus.NOT_FOUND;
  }
}
