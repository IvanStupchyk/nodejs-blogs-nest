import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDto } from '../../../dtos/blogs/blog.dto';
import { isUUID } from '../../../utils/utils';
import { BlogsSqlRepository } from '../../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { HttpStatus } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public body: BlogDto,
    public userId: string,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: UpdateBlogCommand): Promise<number> {
    const { name, websiteUrl, description } = command.body;

    if (!isUUID(command.id)) return HttpStatus.NOT_FOUND;

    const blog = await this.blogsSqlRepository.fetchAllBlogDataById(command.id);
    if (blog && blog.userId !== command.userId) return HttpStatus.FORBIDDEN;

    const result = await this.blogsSqlRepository.updateBlogById(
      command.id,
      name,
      description,
      websiteUrl,
    );

    return result ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
