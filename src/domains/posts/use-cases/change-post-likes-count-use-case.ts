import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { likeStatus } from '../../../types/general.types';
import { errorMessageGenerator } from '../../../utils/error-message-generator';
import { errorsConstants } from '../../../constants/errors.contants';
import { isUUID } from '../../../utils/utils';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { PostLikesRepository } from '../../../infrastructure/repositories/post-likes.repository';
import { PostLikesModel } from '../../../models/posts/Post-likes.model';
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
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}

  async execute(command: ChangePostLikesCountCommand): Promise<number> {
    const { id, myStatus, userId } = command;

    if (!likeStatus[myStatus]) {
      errorMessageGenerator([
        { field: 'likeStatus', message: errorsConstants.likeStatus },
      ]);
    }

    if (!isUUID(id)) return HttpStatus.NOT_FOUND;

    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) return HttpStatus.NOT_FOUND;

    const user = await this.usersRepository.fetchAllUserDataById(userId);
    if (!user) return HttpStatus.NOT_FOUND;

    const userPostLike =
      await this.postLikesRepository.findPostLikesByUserIdAndPostId(userId, id);

    if (
      userPostLike?.myStatus === myStatus ||
      (!userPostLike && myStatus === likeStatus.None)
    ) {
      return HttpStatus.NO_CONTENT;
    }

    if (userPostLike) {
      if (myStatus === likeStatus.None) {
        await this.postLikesRepository.deletePostLike(userPostLike.id);
      }
      await this.postLikesRepository.updateExistingPostLike(
        userId,
        id,
        myStatus,
        new Date().toISOString(),
      );
    } else {
      const newPostLike = new PostLikesModel(
        uuidv4(),
        userId,
        user.login,
        myStatus,
        id,
        new Date().toISOString(),
        new Date().toISOString(),
      );
      await this.postLikesRepository.addPostLike(newPostLike);
    }

    return HttpStatus.NO_CONTENT;
  }
}
