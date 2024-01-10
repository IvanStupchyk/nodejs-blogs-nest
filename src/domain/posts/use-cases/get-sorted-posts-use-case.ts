import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryDto } from '../../../application/dto/posts/posts.query.dto';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';

export class GetSortedPostsCommand {
  constructor(
    public params: PostsQueryDto,
    public userId: string,
  ) {}
}

@CommandHandler(GetSortedPostsCommand)
export class GetSortedPostsUseCase
  implements ICommandHandler<GetSortedPostsCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: GetSortedPostsCommand): Promise<any> {
    return await this.postsRepository.getSortedPosts(
      command.params,
      command.userId,
    );
  }
}
