import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../dto/blogs/blog.input.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogViewType } from '../../../types/blogs.types';

export class CreateBlogCommand {
  constructor(
    public accessTokenHeader: string | undefined,
    public body: BlogInputDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewType> {
    const { name, websiteUrl, description } = command.body;

    //DELETE IT!!!!!!!!!! need to take command.userId
    let newUserId = uuidv4();
    if (command.accessTokenHeader) {
      const accessToken = command.accessTokenHeader.split(' ')[1];
      newUserId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }

    const newBlog = new Blog();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.websiteUrl = websiteUrl;

    return await this.blogsRepository.createBlog(newBlog);
  }
}
