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
import { PostsQueryDto } from '../../application/dto/posts/posts.query.dto';
import { DeletePostWithCheckingCommand } from '../../domain/blogs/use-cases/delete-post-with-checking-use-case';
import { UpdateBlogCommand } from '../../domain/blogs/use-cases/update-blog-use-case';
import { CreatePostCommand } from '../../domain/posts/use-cases/create-post-use-case';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs-query.repository';
import { CreateBlogCommand } from '../../domain/blogs/use-cases/create-blog-use-case';
import { GetPostsForSpecifiedBlogCommand } from '../../domain/posts/use-cases/get-posts-for-specified-blog-use-case';
import { BlogInputDto } from '../../application/dto/blogs/blog.input.dto';
import { GetBlogParamsDto } from '../../application/dto/blogs/get-blog.params.dto';
import { DeletePostParamsDto } from '../../application/dto/posts/delete-post.params.dto';
import { BlogParamsDto } from '../../application/dto/blogs/blog.params.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { UpdatePostParamsDto } from '../../application/dto/posts/update-post.params.dto';
import { BlogsQueryDto } from '../../application/dto/blogs/blogs.query.dto';
import { DeleteBlogParamsDto } from '../../application/dto/blogs/delete-blog.params.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PostForSpecifiedBlogInputDto } from '../../application/dto/posts/post-for-specified-blog.input.dto';
import { DeleteBlogCommand } from '../../domain/blogs/use-cases/delete-blog-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostInputDto } from '../../application/dto/posts/update-post.input.dto';
import { RouterPaths } from '../../constants/router.paths';
import { UpdatePostWithCheckingCommand } from '../../domain/blogs/use-cases/update-post-with-checking-use-case';
import { JwtService } from '../../infrastructure/jwt.service';
import { exceptionHandler } from '../../exception.handler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller(RouterPaths.blogger)
export class BloggerBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @Get()
  async getBlogsForSa(
    @Query() params: BlogsQueryDto,
    @CurrentUserId() currentUserId,
  ) {
    return await this.blogsQueryRepository.getSortedBlogsForSpecifiedUser(
      params,
      currentUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(
    @Body() body: BlogInputDto,
    @Req() req: Request,
    @CurrentUserId() currentUserId,
  ) {
    return await this.commandBus.execute(
      new CreateBlogCommand(currentUserId, body),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/posts')
  async createPost(
    @Param() params: BlogParamsDto,
    @Body() body: PostForSpecifiedBlogInputDto,
    @CurrentUserId() userId,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostCommand(body, params.id, userId),
    );

    if (!post) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/posts')
  async getPostsForSpecifiedBlog(
    @Param() params: GetBlogParamsDto,
    @Query() query: PostsQueryDto,
    @Req() req: Request,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(
        query,
        params.id,
        req.headers?.authorization,
      ),
    );

    if (!posts) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return posts;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':blogId/posts/:postId')
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

  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/posts/:postId')
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
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
