import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { BindBlogParamsDto } from '../../../application/dto/blogs/bind-blog.params.dto';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { exceptionHandler } from '../../../exception.handler';
import { HttpStatus } from '@nestjs/common';

export class BindBlogWithUserCommand {
  constructor(public params: BindBlogParamsDto) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<number | void> {
    const user = await this.usersRepository.fetchAllUserDataById(
      command.params.userId,
    );

    const blog = await this.blogsRepository.findBlogById(command.params.id);

    if (blog.user) {
      return exceptionHandler(HttpStatus.BAD_REQUEST);
    }

    blog.user = user;
    await this.dataSourceRepository.save(blog);

    return HttpStatus.NO_CONTENT;
  }
}
