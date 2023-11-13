import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    if (!ObjectId.isValid(command.id)) return null;
    return await this.blogsRepository.deleteBlog(new ObjectId(command.id));
  }
}
