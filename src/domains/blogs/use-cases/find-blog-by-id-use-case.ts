import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../dto/blog.dto';
import { BlogsService } from '../blogs.service';

export class FindBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(private readonly blogsService: BlogsService) {}

  async execute(command: FindBlogByIdCommand): Promise<BlogModel | null> {
    return this.blogsService.findBlogById(command.id);
  }
}
