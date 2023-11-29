import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryDto } from '../../dto/blogs/blogs.query.dto';
import { Response, Request } from 'express';
import { PostsQueryDto } from '../../dto/posts/posts.query.dto';
import { JwtService } from '../../infrastructure/jwt.service';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { FindBlogByIdCommand } from '../../domains/blogs/use-cases/find-blog-by-id-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs-query.repository';
import { GetPostsForSpecifiedBlogCommand } from '../../domains/posts/use-cases/get-posts-for-specified-blog-use-case';
import { GetBlogParamsDto } from '../../dto/blogs/get-blog.params.dto';

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
  async getCurrentBlog(
    @Param() params: GetBlogParamsDto,
    @Res() res: Response,
  ) {
    const foundBlog = await this.commandBus.execute(
      new FindBlogByIdCommand(params.id),
    );

    !foundBlog ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundBlog);
  }

  @Get(`${RouterPaths.blogs}/:id/posts`)
  async getPostsForSpecifiedBlogForAllUsers(
    @Param() params: GetBlogParamsDto,
    @Query() query: PostsQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(
        query,
        params.id,
        req.headers?.authorization,
      ),
    );
    !posts ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(posts);
  }
}
