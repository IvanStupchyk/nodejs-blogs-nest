import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../dto/blog.dto';
import { BlogDto } from '../../../dtos/blogs/blog.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

export class CreateBlogCommand {
  constructor(
    public userId: string,
    public body: BlogDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogModel> {
    const { name, websiteUrl, description } = command.body;

    //DELETE IT!!!!!!!!!! need to take command.userId
    const newUserId = uuidv4();

    const newBlog: BlogModel = new BlogModel(
      uuidv4(),
      name,
      newUserId,
      description,
      websiteUrl,
      new Date().toISOString(),
      false,
    );

    return await this.blogsRepository.createBlog(newBlog);
  }
}
