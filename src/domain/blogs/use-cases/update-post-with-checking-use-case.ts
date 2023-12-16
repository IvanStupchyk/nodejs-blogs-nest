import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { UpdatePostInputDto } from '../../../dto/posts/update-post.input.dto';
import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class UpdatePostWithCheckingCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
    public body: UpdatePostInputDto,
  ) {}
}

@CommandHandler(UpdatePostWithCheckingCommand)
export class UpdatePostWithCheckingUseCase
  implements ICommandHandler<UpdatePostWithCheckingCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: UpdatePostWithCheckingCommand): Promise<number> {
    const { title, content, shortDescription } = command.body;

    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) return HttpStatus.NOT_FOUND;
    if (blog && blog.user && blog.user.id !== command.userId)
      return HttpStatus.FORBIDDEN;

    const post = await this.postsRepository.findPostById(command.postId);

    if (post) {
      post.title = title;
      post.content = content;
      post.shortDescription = shortDescription;
      await this.dataSourceRepository.save(post);

      return HttpStatus.NO_CONTENT;
    } else {
      return HttpStatus.NOT_FOUND;
    }
  }
}
