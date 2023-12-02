import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { HttpStatus } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<number> {
    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    // const blog = await this.blogsSqlRepository.findBlogById(command.id);
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.blogsRepository.deleteBlog(command.id);

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
