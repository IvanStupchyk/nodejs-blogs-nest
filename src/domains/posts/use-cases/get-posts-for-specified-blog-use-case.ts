import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { GetSortedPostsModel } from '../../../controllers/posts/models/get-sorted-posts.model';
import { PostsType } from '../../../types/posts.types';
import { v4 as uuidv4 } from 'uuid';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { JwtService } from '../../../infrastructure/jwt.service';

export class GetPostsForSpecifiedBlogCommand {
  constructor(
    public query: GetSortedPostsModel,
    public blogId: string,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetPostsForSpecifiedBlogCommand)
export class GetPostsForSpecifiedBlogUseCase
  implements ICommandHandler<GetPostsForSpecifiedBlogCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: GetPostsForSpecifiedBlogCommand,
  ): Promise<PostsType | null> {
    const { query, blogId } = command;

    if (!isUUID(blogId)) return null;

    let userId = uuidv4();
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
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
