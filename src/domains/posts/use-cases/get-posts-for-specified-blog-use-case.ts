import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { PostsQuerySqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-query-sql.repository';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { PostsType } from '../../../types/posts.types';

export class GetPostsForSpecifiedBlogCommand {
  constructor(
    public query: GetSortedPostsModel,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostsForSpecifiedBlogCommand)
export class GetPostsForSpecifiedBlogUseCase
  implements ICommandHandler<GetPostsForSpecifiedBlogCommand>
{
  constructor(
    private readonly postsQuerySqlRepository: PostsQuerySqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: GetPostsForSpecifiedBlogCommand,
  ): Promise<PostsType | null> {
    const { query, blogId, userId } = command;

    if (!isUUID(blogId)) return null;
    const foundBlog =
      await this.blogsSqlRepository.fetchAllBlogDataById(blogId);

    if (foundBlog && foundBlog.userId !== command.userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.postsQuerySqlRepository.findPostsByIdForSpecificBlog(
      query,
      blogId,
      userId,
    );
  }
}
