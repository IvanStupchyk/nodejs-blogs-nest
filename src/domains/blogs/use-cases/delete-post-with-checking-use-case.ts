import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { PostsSqlRepository } from '../../../infrastructure/repositories-raw-sql/posts-sql.repository';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';

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
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: DeletePostWithCheckingCommand): Promise<number> {
    if (!isUUID(command.blogId)) return HttpStatus.NOT_FOUND;
    if (!isUUID(command.postId)) return HttpStatus.NOT_FOUND;

    // const blog = await this.blogsSqlRepository.fetchAllBlogDataById(
    //   command.blogId,
    // );
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.postsSqlRepository.deletePost(command.postId);

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
