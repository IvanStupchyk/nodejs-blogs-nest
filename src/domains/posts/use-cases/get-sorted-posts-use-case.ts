import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryDto } from '../../../dto/posts/posts.query.dto';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../../../infrastructure/jwt.service';

export class GetSortedPostsCommand {
  constructor(
    public params: PostsQueryDto,
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
    let userId = uuidv4();
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.postsRepository.getSortedPosts(command.params, userId);
  }
}
