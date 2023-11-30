import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryDto } from '../../dto/blogs/blogs.query.dto';
import { PostsQueryDto } from '../../dto/posts/posts.query.dto';
import { JwtService } from '../../infrastructure/jwt.service';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { FindBlogByIdCommand } from '../../domains/blogs/use-cases/find-blog-by-id-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs-query.repository';
import { GetPostsForSpecifiedBlogCommand } from '../../domains/posts/use-cases/get-posts-for-specified-blog-use-case';
import { GetBlogParamsDto } from '../../dto/blogs/get-blog.params.dto';
import { exceptionHandler } from '../../exception.handler';

@Controller()
export class BlogController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Get(`${RouterPaths.blogs}`)
  async getBlogs(@Query() params: BlogsQueryDto) {
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @Get(`${RouterPaths.blogs}/:id`)
  async getCurrentBlog(@Param() params: GetBlogParamsDto) {
    const foundBlog = await this.commandBus.execute(
      new FindBlogByIdCommand(params.id),
    );

    if (!foundBlog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundBlog;
  }

  @Get(`${RouterPaths.blogs}/:id/posts`)
  async getPostsForSpecifiedBlogForAllUsers(
    @Param() params: GetBlogParamsDto,
    @Query() query: PostsQueryDto,
    @Headers() headers: any,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(
        query,
        params.id,
        headers?.authorization,
      ),
    );

    if (!posts) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return posts;
  }
}
