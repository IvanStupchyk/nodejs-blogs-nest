import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { likesCounter } from '../../../utils/likes-counter';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class ChangeCommentLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: ObjectId,
  ) {}
}

@CommandHandler(ChangeCommentLikesCountCommand)
export class ChangeCommentLikesCountUseCase
  implements ICommandHandler<ChangeCommentLikesCountCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: ChangeCommentLikesCountCommand): Promise<boolean> {
    const { id, userId, myStatus } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }
    if (!ObjectId.isValid(id)) return false;
    const commentObjectId = new ObjectId(id);
    const foundComment =
      await this.commentsRepository.findCommentById(commentObjectId);
    if (!foundComment) return false;

    const userCommentsLikes =
      await this.usersRepository.findUserCommentLikesById(userId);
    let initialCommentData;

    if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
      initialCommentData = userCommentsLikes.find((c) =>
        new ObjectId(c.commentId).equals(commentObjectId),
      );
    }

    if (initialCommentData?.myStatus === myStatus) return true;

    const { likesInfo, newStatus } = likesCounter(
      myStatus,
      likeStatus.None,
      initialCommentData?.myStatus,
      {
        likesCount: foundComment.likesInfo.likesCount,
        dislikesCount: foundComment.likesInfo.dislikesCount,
      },
    );

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return false;

    if (initialCommentData?.myStatus) {
      user.updateExistingUserCommentLike(newStatus, commentObjectId);
    } else {
      user.setNewUserCommentLike(newStatus, commentObjectId);
    }

    await this.usersRepository.save(user);

    return await this.commentsRepository.changeLikesCount(id, likesInfo);
  }
}
