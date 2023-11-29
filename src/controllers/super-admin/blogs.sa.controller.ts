import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PostsQueryDto } from '../../dto/posts/posts.query.dto';
import { DeletePostWithCheckingCommand } from '../../domains/blogs/use-cases/delete-post-with-checking-use-case';
import { UpdateBlogCommand } from '../../domains/blogs/use-cases/update-blog-use-case';
import { CreatePostCommand } from '../../domains/posts/use-cases/create-post-use-case';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs-query.repository';
import { CreateBlogCommand } from '../../domains/blogs/use-cases/create-blog-use-case';
import { GetPostsForSpecifiedBlogCommand } from '../../domains/posts/use-cases/get-posts-for-specified-blog-use-case';
import { BlogInputDto } from '../../dto/blogs/blog.input.dto';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { GetBlogParamsDto } from '../../dto/blogs/get-blog.params.dto';
import { DeletePostParamsDto } from '../../dto/posts/delete-post.params.dto';
import { BlogParamsDto } from '../../dto/blogs/blog.params.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { UpdatePostParamsDto } from '../../dto/posts/update-post.params.dto';
import { BlogsQueryDto } from '../../dto/blogs/blogs.query.dto';
import { DeleteBlogParamsDto } from '../../dto/blogs/delete-blog.params.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PostForSpecifiedBlogInputDto } from '../../dto/posts/post-for-specified-blog.input.dto';
import { DeleteBlogCommand } from '../../domains/blogs/use-cases/delete-blog-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostInputDto } from '../../dto/posts/update-post.input.dto';
import { RouterPaths } from '../../constants/router.paths';
import { UpdatePostWithCheckingCommand } from '../../domains/blogs/use-cases/update-post-with-checking-use-case';
import { JwtService } from '../../infrastructure/jwt.service';

@Controller()
export class BlogSaController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, BasicAuthGuard)
  @Get(`${RouterPaths.saBlogs}`)
  async getBlogsForSa(@Query() params: BlogsQueryDto) {
    return await this.blogsQueryRepository.getSortedBlogs(
      params,
      'id from CurrentUserId',
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.saBlogs}`)
  async createBlog(@Body() body: BlogInputDto, @Req() req: Request) {
    return await this.commandBus.execute(
      new CreateBlogCommand(req.headers?.authorization, body),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.saBlogs}/:id/posts`)
  async createPost(
    @Param() params: BlogParamsDto,
    @Body() body: PostForSpecifiedBlogInputDto,
    @CurrentUserId() userId,
    @Res() res: Response,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostCommand(body, params.id, userId),
    );

    !post ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(post);
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get(`${RouterPaths.saBlogs}/:id/posts`)
  async getPostsForSpecifiedBlog(
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

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.saBlogs}/:blogId/posts/:postId`)
  async updateSpecifiedPost(
    @Param() params: UpdatePostParamsDto,
    @Body() body: UpdatePostInputDto,
    @CurrentUserId() userId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new UpdatePostWithCheckingCommand(
          userId,
          params.blogId,
          params.postId,
          body,
        ),
      ),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.saBlogs}/:blogId/posts/:postId`)
  async deleteSpecifiedPost(
    @Param() params: DeletePostParamsDto,
    @CurrentUserId() userId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new DeletePostWithCheckingCommand(userId, params.blogId, params.postId),
      ),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.saBlogs}/:id`)
  async updateBlog(
    @Param() params: BlogParamsDto,
    @Body() body: BlogInputDto,
    @CurrentUserId() userId,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new UpdateBlogCommand(body, userId, params.id),
      ),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.saBlogs}/:id`)
  async deleteBlog(
    @Param() params: DeleteBlogParamsDto,
    @Res() res: Response,
    @CurrentUserId() userId,
  ) {
    res.sendStatus(
      await this.commandBus.execute(new DeleteBlogCommand(params.id, userId)),
    );
  }
}
