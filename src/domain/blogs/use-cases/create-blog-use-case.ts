import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../dto/blogs/blog.input.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../../../infrastructure/jwt.service';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogViewType } from '../../../types/blogs.types';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';

export class CreateBlogCommand {
  constructor(
    public accessTokenHeader: string | undefined,
    public body: BlogInputDto,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
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

    const savedBlog = await this.dataSourceRepository.save(newBlog);

    return {
      id: savedBlog.id,
      name: savedBlog.name,
      // userId: savedBlog.userId,
      description: savedBlog.description,
      websiteUrl: savedBlog.websiteUrl,
      createdAt: savedBlog.createdAt,
      isMembership: savedBlog.isMembership,
    };
  }
}
