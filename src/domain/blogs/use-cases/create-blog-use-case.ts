import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../dto/blogs/blog.input.dto';
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
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewType> {
    const { name, websiteUrl, description } = command.body;

    const user = await this.usersRepository.fetchAllUserDataById(
      command.userId,
    );
    const newBlog = new Blog();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.websiteUrl = websiteUrl;
    newBlog.user = user;
    const savedBlog = await this.dataSourceRepository.save(newBlog);

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
