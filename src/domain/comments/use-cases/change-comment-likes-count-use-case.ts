import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments/comments.repository';
import { CommentLikesRepository } from '../../../infrastructure/repositories/comments/comment-likes.repository';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

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
    private readonly dataSourceRepository: DataSourceRepository,
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

    let likeStatement;

    if (userCommentLike) {
      likeStatement = userCommentLike;
    } else {
      likeStatement = new CommentLike();
    }

    likeStatement.user = user;
    likeStatement.comment = foundComment;
    likeStatement.likeStatus = myStatus;

    await this.dataSourceRepository.save(likeStatement);

    return HttpStatus.NO_CONTENT;
  }
}
