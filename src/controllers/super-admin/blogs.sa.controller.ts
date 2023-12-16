import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs-query.repository';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsQueryDto } from '../../application/dto/blogs/blogs.query.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RouterPaths } from '../../constants/router.paths';
import { JwtService } from '../../infrastructure/jwt.service';
import { BindBlogParamsDto } from '../../application/dto/blogs/bind-blog.params.dto';
import { BindBlogWithUserCommand } from '../../domain/blogs/use-cases/bind-blog-with-user-use-case';

@Controller(RouterPaths.saBlogs)
export class BlogSaController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, BasicAuthGuard)
  @Get()
  async getBlogsForSa(@Query() query: BlogsQueryDto) {
    return await this.blogsQueryRepository.getSortedBlogsWithUserInfo(query);
  }

  @UseGuards(ThrottlerGuard, BasicAuthGuard)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(@Param() params: BindBlogParamsDto) {
    return await this.commandBus.execute(new BindBlogWithUserCommand(params));
  }
}
