import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../dto/blog.dto';
import { BlogDto } from '../../../dtos/blogs/blog.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';

export class CreateBlogCommand {
  constructor(
    public userId: string,
    public body: BlogDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogModel> {
    const { name, websiteUrl, description } = command.body;

    const newBlog: BlogModel = new BlogModel(
      uuidv4(),
      name,
      command.userId,
      description,
      websiteUrl,
      new Date().toISOString(),
      false,
    );

    return await this.blogsSqlRepository.createBlog(newBlog);
  }
}
