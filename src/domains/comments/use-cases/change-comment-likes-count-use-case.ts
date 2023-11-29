import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentLikesRepository } from '../../../infrastructure/repositories/comment-likes.repository';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class ChangeCommentLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: string,
  ) {}
}

@CommandHandler(ChangeCommentLikesCountCommand)
export class ChangeCommentLikesCountUseCase
  implements ICommandHandler<ChangeCommentLikesCountCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: ChangeCommentLikesCountCommand): Promise<number> {
    const { id, userId, myStatus } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const foundComment =
      await this.commentsRepository.fetchAllCommentDataById(id);
    if (!foundComment) return HttpStatus.NOT_FOUND;

    const userCommentLike =
      await this.commentLikesRepository.findCommentLikesByUserIdAndCommentId(
        userId,
        id,
      );

    if (
      userCommentLike?.likeStatus === myStatus ||
      (!userCommentLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    if (userCommentLike) {
      if (myStatus === likeStatus.None) {
        await this.commentLikesRepository.deleteCommentLike(userCommentLike.id);
        return HttpStatus.NO_CONTENT;
      }
      userCommentLike.likeStatus = myStatus;
      await this.commentLikesRepository.save(userCommentLike);
    } else {
      const commentLike = new CommentLike();
      commentLike.user = user;
      commentLike.comment = foundComment;
      commentLike.likeStatus = myStatus;
      await this.commentLikesRepository.save(commentLike);
    }

    return HttpStatus.NO_CONTENT;
  }
}
