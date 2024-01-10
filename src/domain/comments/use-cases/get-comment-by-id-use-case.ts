import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { CommentsRepository } from '../../../infrastructure/repositories/comments/comments.repository';
import { CommentViewType } from '../../../types/comments.types';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase
  implements ICommandHandler<GetCommentByIdCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: GetCommentByIdCommand,
  ): Promise<CommentViewType | null> {
    if (!isUUID(command.commentId)) return null;

    return await this.commentsRepository.findCommentById(
      command.commentId,
      command.userId,
    );
  }
}
