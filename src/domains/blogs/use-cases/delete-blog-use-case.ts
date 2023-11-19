import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { HttpStatus } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogCommand): Promise<number> {
    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    // const blog = await this.blogsSqlRepository.fetchAllBlogDataById(command.id);
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.blogsSqlRepository.deleteBlog(command.id);

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
