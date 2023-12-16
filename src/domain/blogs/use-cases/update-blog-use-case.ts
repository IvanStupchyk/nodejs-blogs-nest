import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../application/dto/blogs/blog.input.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { HttpStatus } from '@nestjs/common';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { Blog } from '../../../entities/blogs/Blog.entity';

export class UpdateBlogCommand {
  constructor(
    public body: BlogInputDto,
    public userId: string,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<number> {
    const { name, websiteUrl, description } = command.body;

    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsRepository.findBlogById(command.id);
    Blog.update(blog, description, websiteUrl, name, command.userId);

    await this.dataSourceRepository.save(blog);

    blog.getUncommittedEvents().forEach((e) => this.eventBus.publish(e));

    return HttpStatus.NO_CONTENT;
  }
}
