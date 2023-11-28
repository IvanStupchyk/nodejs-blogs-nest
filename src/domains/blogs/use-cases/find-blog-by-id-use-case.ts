import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { BlogViewType } from '../../../types/blogs.types';

export class FindBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: FindBlogByIdCommand): Promise<BlogViewType | null> {
    if (!isUUID(command.id)) return null;
    const blog = await this.blogsRepository.findBlogById(command.id);

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
      createdAt: blog.createdAt,
    };
  }
}
