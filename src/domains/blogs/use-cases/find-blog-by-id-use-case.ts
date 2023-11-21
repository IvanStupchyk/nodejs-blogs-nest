import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../dto/blog.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';

export class FindBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: FindBlogByIdCommand): Promise<BlogModel | null> {
    if (!isUUID(command.id)) return null;
    return await this.blogsSqlRepository.findBlogById(command.id);
  }
}
