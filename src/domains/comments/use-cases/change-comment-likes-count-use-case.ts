import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { CommentsSqlRepository } from '../../../infrastructure/repositories-raw-sql/comments-sql.repository';
import { CommentViewModel } from '../../../controllers/comments/models/comment-view.model';
import { CommentLikesSqlRepository } from '../../../infrastructure/repositories-raw-sql/comment-likes-sql.repository';
import { v4 as uuidv4 } from 'uuid';
import { CommentLikeModel } from '../../../controllers/comments/models/Comment-like.model';

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
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly commentLikesSqlRepository: CommentLikesSqlRepository,
  ) {}

  async execute(command: ChangeCommentLikesCountCommand): Promise<number> {
    const { id, userId, myStatus } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundComment: CommentViewModel =
      await this.commentsSqlRepository.findCommentById(id);
    if (!foundComment) return HttpStatus.NOT_FOUND;
    console.log('foundComment', foundComment);
    const userCommentLike =
      await this.commentLikesSqlRepository.findCommentLikesByUserIdAndCommentId(
        userId,
        id,
      );
    console.log('userCommentLike', userCommentLike);
    if (
      userCommentLike?.myStatus === myStatus ||
      (!userCommentLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    if (userCommentLike) {
      if (myStatus === likeStatus.None) {
        await this.commentLikesSqlRepository.deleteCommentLike(
          userCommentLike.id,
        );
      }
      await this.commentLikesSqlRepository.updateExistingCommentLike(
        userId,
        id,
        myStatus,
      );
    } else {
      const newCommentLike = new CommentLikeModel(
        uuidv4(),
        userId,
        id,
        myStatus,
        new Date().toISOString(),
      );
      await this.commentLikesSqlRepository.addCommentLike(newCommentLike);
    }

    return HttpStatus.NO_CONTENT;
  }
}
