import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { CommentViewType } from '../../../types/comment-view.type';
import { CommentLikesRepository } from '../../../infrastructure/repositories/comment-likes.repository';
import { v4 as uuidv4 } from 'uuid';
import { CommentLikeModel } from '../../../models/comments/Comment-like.model';

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
  ) {}

  async execute(command: ChangeCommentLikesCountCommand): Promise<number> {
    const { id, userId, myStatus } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundComment: CommentViewType =
      await this.commentsRepository.findCommentById(id);
    if (!foundComment) return HttpStatus.NOT_FOUND;
    console.log('foundComment', foundComment);
    const userCommentLike =
      await this.commentLikesRepository.findCommentLikesByUserIdAndCommentId(
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
        await this.commentLikesRepository.deleteCommentLike(userCommentLike.id);
      }
      await this.commentLikesRepository.updateExistingCommentLike(
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
      await this.commentLikesRepository.addCommentLike(newCommentLike);
    }

    return HttpStatus.NO_CONTENT;
  }
}
