import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { NotFoundException } from '@nestjs/common';
import { PostForSpecifiedBlogInputDto } from '../../../dto/posts/post-for-specified-blog.input.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { PostViewType } from '../../../types/posts.types';

export class CreatePostForSpecifiedBlogCommand {
  constructor(
    public postData: PostForSpecifiedBlogInputDto,
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
  ): Promise<PostViewType> {
    const { title, content, shortDescription } = command.postData;

    if (!isUUID(command.blogId)) return null;
    const foundBlog = await this.blogsRepository.findBlogById(command.blogId);

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
