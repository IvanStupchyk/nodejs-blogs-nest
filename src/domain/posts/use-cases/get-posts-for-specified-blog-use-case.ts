import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { PostsQueryDto } from '../../../application/dto/posts/posts.query.dto';
import { PostsType } from '../../../types/posts.types';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { JwtService } from '../../../infrastructure/jwt.service';

export class GetPostsForSpecifiedBlogCommand {
  constructor(
    public query: PostsQueryDto,
    public blogId: string,
    public accessTokenHeader: string | undefined,
  ) {}
}

@CommandHandler(GetPostsForSpecifiedBlogCommand)
export class GetPostsForSpecifiedBlogUseCase
  implements ICommandHandler<GetPostsForSpecifiedBlogCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
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
    //   await this.blogsSqlRepository.findBlogById(blogId);
    //
    // if (foundBlog && foundBlog.userId !== command.userId) {
    //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // }

    return await this.postsRepository.getPostsByIdForSpecificBlog(
      query,
      blogId,
      userId,
    );
  }
}
