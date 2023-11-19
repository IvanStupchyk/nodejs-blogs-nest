import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { HttpStatus } from '@nestjs/common';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';

export class UpdatePostWithCheckingCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
    public body: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostWithCheckingCommand)
export class UpdatePostWithCheckingUseCase
  implements ICommandHandler<UpdatePostWithCheckingCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: UpdatePostWithCheckingCommand): Promise<number> {
    const { title, content, shortDescription } = command.body;

    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsSqlRepository.fetchAllBlogDataById(
      command.blogId,
    );
    if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.postsSqlRepository.updatePost(
      command.postId,
      title,
      content,
      shortDescription,
    );

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
