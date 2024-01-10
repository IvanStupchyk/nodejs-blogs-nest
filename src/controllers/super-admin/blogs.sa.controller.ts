import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs-query.repository';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsQueryDto } from '../../application/dto/blogs/blogs.query.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RouterPaths } from '../../constants/router.paths';
import { BindBlogParamsDto } from '../../application/dto/blogs/bind-blog.params.dto';
import { BindBlogWithUserCommand } from '../../domain/blogs/use-cases/bind-blog-with-user-use-case';
import { SaUserBanBlogInputDto } from '../../application/dto/users/sa-user-ban-blog.input.dto';
import { BanBlogBySaCommand } from '../../domain/blogs/use-cases/ban-blog-by-sa-use-case';

@Controller(RouterPaths.saBlogs)
export class BlogSaController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, BasicAuthGuard)
  @Get()
  async getBlogsForSa(@Query() query: BlogsQueryDto) {
    return await this.blogsQueryRepository.getSortedBlogsWithUserInfo(query);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async BanBlog(@Param('id') id: string, @Body() body: SaUserBanBlogInputDto) {
    return await this.commandBus.execute(new BanBlogBySaCommand(id, body));
  }

  @UseGuards(ThrottlerGuard, BasicAuthGuard)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(@Param() params: BindBlogParamsDto) {
    return await this.commandBus.execute(new BindBlogWithUserCommand(params));
  }
}
