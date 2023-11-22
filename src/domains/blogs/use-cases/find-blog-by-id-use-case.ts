import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../../../models/blogs/Blog.model';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

export class FindBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: FindBlogByIdCommand): Promise<BlogModel | null> {
    if (!isUUID(command.id)) return null;
    return await this.blogsRepository.findBlogById(command.id);
  }
}
