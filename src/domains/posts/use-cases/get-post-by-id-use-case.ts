import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { ObjectId } from 'mongodb';
import { likeStatus } from '../../../types/general.types';
import { LikesRepository } from '../../../infrastructure/repositories/likes.repository';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly jwtService: JwtService,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(command: GetPostByIdCommand): Promise<PostViewModel | null> {
    if (!ObjectId.isValid(command.id)) return null;
    const objectPostId = new ObjectId(command.id);

    let userId;
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    let userLikeStatus = likeStatus.None;

    if (userId) {
      const userCommentsLikes =
        await this.likesRepository.findPostLikeByUserIdAndPostId(
          userId,
          objectPostId,
        );

      if (userCommentsLikes) userLikeStatus = userCommentsLikes.myStatus;
    }

    return await this.postsRepository.getPost(objectPostId, userLikeStatus);
  }
}
