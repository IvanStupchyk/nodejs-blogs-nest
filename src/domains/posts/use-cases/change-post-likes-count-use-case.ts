import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { ObjectId } from 'mongodb';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { likesCounter } from '../../../utils/likes-counter';
import { PostLikeUserInfoType } from '../../../types/posts-likes.types';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { LikesRepository } from '../../../infrastructure/repositories/likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikeModelType,
  PostLikes,
} from '../../../schemas/post-likes.schema';

export class ChangePostLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: ObjectId,
  ) {}
}

@CommandHandler(ChangePostLikesCountCommand)
export class ChangePostLikesCountUseCase
  implements ICommandHandler<ChangePostLikesCountCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likesRepository: LikesRepository,
    @InjectModel(PostLikes.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async execute(command: ChangePostLikesCountCommand): Promise<number> {
    const { id, myStatus, userId } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!ObjectId.isValid(id)) return HttpStatus.NOT_FOUND;
    const postObjectId = new ObjectId(id);
    const foundPost = await this.postsRepository.findPostById(postObjectId);
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.findUserById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const userPostLike =
      await this.likesRepository.findPostLikeByUserIdAndPostId(
        userId,
        postObjectId,
      );
    const initialStatus = userPostLike?.myStatus;

    if (initialStatus === myStatus) return HttpStatus.NO_CONTENT;

    const { likesInfo, newStatus } = likesCounter(
      myStatus,
      likeStatus.None,
      initialStatus,
      {
        likesCount: foundPost.extendedLikesInfo.likesCount,
        dislikesCount: foundPost.extendedLikesInfo.dislikesCount,
      },
    );

    if (userPostLike) {
      userPostLike.updateExistingPostLike(newStatus);
      await this.likesRepository.save(userPostLike);
    } else {
      const postLike = this.PostLikeModel.createPostLike(
        userId,
        postObjectId,
        newStatus,
        this.PostLikeModel,
      );
      await this.likesRepository.save(postLike);
    }

    if (newStatus === likeStatus.Like) {
      const userPostLikeViewInfo: PostLikeUserInfoType = {
        addedAt: new Date().toISOString(),
        userId,
        login: user.login,
      };
      foundPost.setNewUserPostLike(userPostLikeViewInfo);
    }

    if (newStatus === likeStatus.None || newStatus === likeStatus.Dislike) {
      await this.postsRepository.deleteUserLikeInfo(postObjectId, userId);
    }

    foundPost.changeLikesCount(likesInfo.likesCount, likesInfo.dislikesCount);
    await this.postsRepository.save(foundPost);
    return HttpStatus.NO_CONTENT;
  }
}
