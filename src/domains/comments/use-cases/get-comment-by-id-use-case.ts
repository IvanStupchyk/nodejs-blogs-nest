import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { likeStatus } from '../../../types/general.types';
import { CommentViewModel } from '../../../controllers/comments/models/comment-view.model';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { JwtService } from '../../../infrastructure/jwt.service';

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
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: GetCommentByIdCommand,
  ): Promise<CommentViewModel | null> {
    const { commentId, accessTokenHeader } = command;

    if (!ObjectId.isValid(commentId)) return null;
    const commentObjectId = new ObjectId(commentId);

    let userId;
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    let finalCommentStatus = likeStatus.None;

    if (userId) {
      const userCommentsLikes =
        await this.usersRepository.findUserCommentLikesById(userId);

      if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
        const initialCommentData = userCommentsLikes.find((c) =>
          new ObjectId(c.commentId).equals(commentObjectId),
        );

        if (initialCommentData) {
          finalCommentStatus = initialCommentData.myStatus;
        }
      }
    }

    return await this.commentsRepository.findCommentById(
      commentObjectId,
      finalCommentStatus,
    );
  }
}
