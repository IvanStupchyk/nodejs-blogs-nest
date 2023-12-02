import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../dto/blogs/blog.input.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { HttpStatus } from '@nestjs/common';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

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
  ) {}

  async execute(command: UpdateBlogCommand): Promise<number> {
    const { name, websiteUrl, description } = command.body;

    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    // const blog = await this.blogsSqlRepository.findBlogById(command.id);
    // if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;
    const blog = await this.blogsRepository.findBlogById(command.id);

    if (!blog) {
      return HttpStatus.NOT_FOUND;
    } else {
      blog.name = name;
      blog.websiteUrl = websiteUrl;
      blog.description = description;

      await this.dataSourceRepository.save(blog);

      return HttpStatus.NO_CONTENT;
    }
  }
}
