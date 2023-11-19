import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PostForSpecificBlogDto } from '../../../dtos/posts/post-for-specific-blog.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';

export class CreatePostForSpecifiedBlogCommand {
  constructor(
    public postData: PostForSpecificBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostForSpecifiedBlogCommand)
export class CreatePostForSpecifiedBlogUseCase
  implements ICommandHandler<CreatePostForSpecifiedBlogCommand>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: CreatePostForSpecifiedBlogCommand,
  ): Promise<PostViewModel> {
    const { title, content, shortDescription } = command.postData;

    if (!isUUID(command.blogId)) return null;
    const foundBlog = await this.blogsSqlRepository.fetchAllBlogDataById(
      command.blogId,
    );

    if (!foundBlog) {
      throw new NotFoundException();
    }
    if (foundBlog && foundBlog.userId !== command.userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.postsService.createPost({
      title,
      content,
      shortDescription,
      blogId: command.blogId,
    });
  }
}
