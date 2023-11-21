import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { PostsType } from '../../../types/posts.types';
import { v4 as uuidv4 } from 'uuid';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';

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
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: GetPostsForSpecifiedBlogCommand,
  ): Promise<PostsType | null> {
    const { query, blogId } = command;

    if (!isUUID(blogId)) return null;

    let userId = command.userId;

    if (!command.userId || !isUUID(command.userId)) {
      userId = uuidv4();
    }
    // const foundBlog =
    //   await this.blogsSqlRepository.fetchAllBlogDataById(blogId);
    //
    // if (foundBlog && foundBlog.userId !== command.userId) {
    //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // }

    return await this.postsSqlRepository.getPostsByIdForSpecificBlog(
      query,
      blogId,
      userId,
    );
  }
}
