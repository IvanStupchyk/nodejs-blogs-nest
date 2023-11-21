import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikeModelType,
  PostLikes,
} from '../../../schemas/post-likes.schema';
import { isUUID } from '../../../utils/utils';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { UsersSqlRepository } from '../../../infrastructure/repositories-raw-sql/users-sql.repository';
import { PostLikesSqlRepository } from '../../../infrastructure/repositories-raw-sql/post-likes-sql.repository';
import { PostModel } from '../../../controllers/posts/models/Post.model';
import { PostLikeModel } from '../../../controllers/posts/models/Post-like.model';
import { v4 as uuidv4 } from 'uuid';

export class ChangePostLikesCountCommand {
  constructor(
    public id: string,
    public myStatus: string,
    public userId: string,
  ) {}
}

@CommandHandler(ChangePostLikesCountCommand)
export class ChangePostLikesCountUseCase
  implements ICommandHandler<ChangePostLikesCountCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly postLikesSqlRepository: PostLikesSqlRepository,
    @InjectModel(PostLikes.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async execute(command: ChangePostLikesCountCommand): Promise<number> {
    const { id, myStatus, userId } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundPost: PostModel = await this.postsSqlRepository.findPostById(id);
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersSqlRepository.fetchAllUserDataById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const userPostLike =
      await this.postLikesSqlRepository.findPostLikesByUserIdAndPostId(
        userId,
        id,
      );

    if (
      userPostLike?.myStatus === myStatus ||
      (!userPostLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    if (userPostLike) {
      if (myStatus === likeStatus.None) {
        await this.postLikesSqlRepository.deletePostLike(userPostLike.id);
      }
      await this.postLikesSqlRepository.updateExistingPostLike(
        userId,
        id,
        myStatus,
        new Date().toISOString(),
      );
    } else {
      const newPostLike = new PostLikeModel(
        uuidv4(),
        userId,
        user.login,
        myStatus,
        id,
        new Date().toISOString(),
        new Date().toISOString(),
      );
      await this.postLikesSqlRepository.addPostLike(newPostLike);
    }

    // if (newStatus === likeStatus.Like) {
    //   const userPostLikeViewInfo: PostLikeUserInfoType = {
    //     addedAt: new Date().toISOString(),
    //     userId,
    //     login: user.login,
    //   };
    //   foundPost.setNewUserPostLike(userPostLikeViewInfo);
    // }
    //
    // if (newStatus === likeStatus.None || newStatus === likeStatus.Dislike) {
    //   await this.postsRepository.deleteUserLikeInfo(postObjectId, userId);
    // }
    //
    // foundPost.changeLikesCount(likesInfo.likesCount, likesInfo.dislikesCount);
    // await this.postsRepository.save(foundPost);
    return HttpStatus.NO_CONTENT;
  }
}
