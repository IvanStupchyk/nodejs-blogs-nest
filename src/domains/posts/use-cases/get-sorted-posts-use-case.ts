import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { v4 as uuidv4 } from 'uuid';
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
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: GetSortedPostsCommand): Promise<any> {
    let userId = uuidv4();
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    return await this.postsSqlRepository.getSortedPosts(command.params, userId);
  }
}
