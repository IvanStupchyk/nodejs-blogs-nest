import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { UpdatePostInputDto } from '../../../dto/posts/update-post.input.dto';
import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

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
  ) {}

  async execute(command: UpdatePostWithCheckingCommand): Promise<number> {
    const { title, content, shortDescription } = command.body;

    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsRepository.fetchAllBlogDataById(
      command.blogId,
    );
    if (!blog) return HttpStatus.NOT_FOUND;
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.postsRepository.updatePost(
      command.postId,
      title,
      content,
      shortDescription,
    );

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
