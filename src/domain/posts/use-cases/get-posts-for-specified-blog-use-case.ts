import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { PostsQueryDto } from '../../../application/dto/posts/posts.query.dto';
import { PostsType } from '../../../types/posts/posts.types';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';

export class GetPostsForSpecifiedBlogCommand {
  constructor(
    public query: PostsQueryDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostsForSpecifiedBlogCommand)
export class GetPostsForSpecifiedBlogUseCase
  implements ICommandHandler<GetPostsForSpecifiedBlogCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(
    command: GetPostsForSpecifiedBlogCommand,
  ): Promise<PostsType | null> {
    const { query, blogId, userId } = command;

    if (!isUUID(blogId)) return null;

    return await this.postsRepository.getPostsByIdForSpecificBlog(
      query,
      blogId,
      userId,
    );
  }
}
