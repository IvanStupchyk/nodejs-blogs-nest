import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostViewModel } from '../../../controllers/posts/models/post-view.model';
import { NotFoundException } from '@nestjs/common';
import { PostForSpecificBlogDto } from '../../../dtos/posts/post-for-specific-blog.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

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
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreatePostForSpecifiedBlogCommand,
  ): Promise<PostViewModel> {
    const { title, content, shortDescription } = command.postData;

    if (!isUUID(command.blogId)) return null;
    const foundBlog = await this.blogsRepository.fetchAllBlogDataById(
      command.blogId,
    );

    if (!foundBlog) {
      throw new NotFoundException();
    }
    // if (foundBlog && foundBlog.userId !== command.userId) {
    //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // }

    return await this.postsService.createPost({
      title,
      content,
      shortDescription,
      blogId: command.blogId,
    });
  }
}
