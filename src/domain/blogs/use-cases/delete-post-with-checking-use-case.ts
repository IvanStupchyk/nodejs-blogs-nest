import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';

export class DeletePostWithCheckingCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostWithCheckingCommand)
export class DeletePostWithCheckingUseCase
  implements ICommandHandler<DeletePostWithCheckingCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: DeletePostWithCheckingCommand): Promise<number> {
    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) return HttpStatus.NOT_FOUND;
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.postsRepository.deletePost(command.postId);

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
