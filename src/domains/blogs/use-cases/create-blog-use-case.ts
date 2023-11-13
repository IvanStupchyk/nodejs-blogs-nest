import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogType } from '../dto/blog.dto';
import { ObjectId } from 'mongodb';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { BlogDto } from '../../../dtos/blogs/blog.dto';

export class CreateBlogCommand {
  constructor(public body: BlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogType> {
    const { name, websiteUrl, description } = command.body;

    const newBlog: BlogType = new BlogType(
      new ObjectId(),
      name,
      description,
      websiteUrl,
      new Date().toISOString(),
      false,
    );

    return await this.blogsRepository.createBlog(newBlog);
  }
}
