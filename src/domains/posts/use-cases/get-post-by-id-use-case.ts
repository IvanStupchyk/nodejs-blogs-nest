import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { likeStatus } from '../../../types/general.types';
import { LikesRepository } from '../../../infrastructure/repositories/likes.repository';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';
import { isUUID } from '../../../utils/utils';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly jwtService: JwtService,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(command: GetPostByIdCommand): Promise<PostViewModel | null> {
    if (!isUUID(command.id)) return null;

    let userId;
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    const userLikeStatus = likeStatus.None;

    if (userId) {
      // const userCommentsLikes =
      //   await this.likesRepository.findPostLikeByUserIdAndPostId(
      //     userId,
      //     command.id,
      //   );
      //
      // if (userCommentsLikes) userLikeStatus = userCommentsLikes.myStatus;
    }

    return await this.postsSqlRepository.getPost(command.id, userLikeStatus);
  }
}
