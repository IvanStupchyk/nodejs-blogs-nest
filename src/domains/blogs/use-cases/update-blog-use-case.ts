import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { BlogDto } from '../../../dtos/blogs/blog.dto';

export class UpdateBlogCommand {
  constructor(
    public body: BlogDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, websiteUrl, description } = command.body;

    if (!ObjectId.isValid(command.id)) return null;

    return await this.blogsRepository.updateBlogById(
      new ObjectId(command.id),
      name,
      description,
      websiteUrl,
    );
  }
}
