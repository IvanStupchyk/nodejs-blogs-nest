import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewModel } from '../../../controllers/comments/models/comment-view.model';
import { JwtService } from '../../../infrastructure/jwt.service';
import { isUUID } from '../../../utils/utils';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase
  implements ICommandHandler<GetCommentByIdCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: GetCommentByIdCommand,
  ): Promise<CommentViewModel | null> {
    if (!isUUID(command.commentId)) return null;

    let userId;
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.commentsRepository.findCommentById(
      command.commentId,
      userId,
    );
  }
}
