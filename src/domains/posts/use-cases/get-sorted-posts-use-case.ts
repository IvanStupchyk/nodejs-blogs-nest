import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { JwtService } from '../../../infrastructure/jwt.service';

export class GetSortedPostsCommand {
  constructor(
    public params: GetSortedPostsModel,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetSortedPostsCommand)
export class GetSortedPostsUseCase
  implements ICommandHandler<GetSortedPostsCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: GetSortedPostsCommand): Promise<any> {
    let userId;
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.postsRepository.getSortedPosts(command.params, userId);
  }
}
