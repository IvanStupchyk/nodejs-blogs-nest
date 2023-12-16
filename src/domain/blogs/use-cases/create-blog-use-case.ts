import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../application/dto/blogs/blog.input.dto';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogViewType } from '../../../types/blogs.types';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';

export class CreateBlogCommand {
  constructor(
    public userId: string,
    public body: BlogInputDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly usersRepository: UsersRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewType> {
    const { name, websiteUrl, description } = command.body;

    const user = await this.usersRepository.fetchAllUserDataById(
      command.userId,
    );

    const newBlog = Blog.create(name, description, websiteUrl, user);
    const savedBlog = await this.dataSourceRepository.save(newBlog);

    newBlog.getUncommittedEvents().forEach((e) => this.eventBus.publish(e));
    return {
      id: savedBlog.id,
      name: savedBlog.name,
      description: savedBlog.description,
      websiteUrl: savedBlog.websiteUrl,
      createdAt: savedBlog.createdAt,
      isMembership: savedBlog.isMembership,
    };
  }
}
