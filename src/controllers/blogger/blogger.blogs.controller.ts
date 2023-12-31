import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { PostsQueryDto } from '../../application/dto/posts/posts.query.dto';
import { DeletePostWithCheckingCommand } from '../../domain/posts/use-cases/delete-post-use-case';
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
import { UpdatePostWithCheckingCommand } from '../../domain/posts/use-cases/update-post-use-case';
import { exceptionHandler } from '../../utils/errors/exception.handler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanUserByBloggerParamsDto } from '../../application/dto/blogs/ban-user-by-blogger.params.dto';
import { BanUserByBloggerCommand } from '../../domain/users/use-cases/ban-user-by-blogger-use-case';
import { UserBanByBloggerInputDto } from '../../application/dto/blogs/user-ban-by-blogger.input.dto';
import { BanUsersQueryDto } from '../../application/dto/blogs/ban-users.query.dto';
import { FindBanUsersByBloggerCommand } from '../../domain/users/use-cases/find-ban-users-by-blogger-use-case';
import { CommentsQueryDto } from '../../application/dto/comments/comments.query.dto';
import { CommentsQueryRepository } from '../../infrastructure/repositories/comments/comments-query.repository';
import { exceptionImagesFactory } from '../../utils/errors/exception-images.factory';
import { PostImageParamsDto } from '../../application/dto/posts/post-image.params.dto';
import { ImageValidator } from '../../utils/validators/image-validator';
import { AddImagePostCommand } from '../../domain/posts/use-cases/add-image-post-use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddMainBlogImageCommand } from '../../domain/blogs/use-cases/add-main-blog-image-use-case';
import { AddBlogWallpaperCommand } from '../../domain/blogs/use-cases/add-blog-wallpaper-use-case';

@Controller(RouterPaths.blogger)
export class BloggerBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @Get('blogs')
  async getBlogsForSa(
    @Query() query: BlogsQueryDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.blogsQueryRepository.getSortedBlogsForSpecifiedUser(
      query,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs/comments')
  async getCommentsForBlogger(
    @Query() query: CommentsQueryDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commentsQueryRepository.getSortedBloggerComments(
      query,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('blogs')
  async createBlog(
    @Body() body: BlogInputDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(new CreateBlogCommand(userId, body));
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('blogs/:blogId/posts/:postId/images/main')
  async addMainPostImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(940, 432, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param() params: PostImageParamsDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(
      new AddImagePostCommand(userId, params.blogId, params.postId, file),
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('blogs/:id/images/main')
  async addMainBlogImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(156, 156, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param() params: BlogParamsDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(
      new AddMainBlogImageCommand(userId, params.id, file),
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('blogs/:id/images/wallpaper')
  async addBlogWallpaper(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(1028, 312, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param() params: BlogParamsDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(
      new AddBlogWallpaperCommand(userId, params.id, file),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/ban')
  @HttpCode(204)
  async banUser(
    @Param() params: BanUserByBloggerParamsDto,
    @Body() body: UserBanByBloggerInputDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(
      new BanUserByBloggerCommand(params.id, body, userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async getBanUsersForSpecifiedBlog(
    @Param() params: BanUserByBloggerParamsDto,
    @Query() query: BanUsersQueryDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.commandBus.execute(
      new FindBanUsersByBloggerCommand(params.id, query, userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('blogs/:id/posts')
  async createPost(
    @Param() params: BlogParamsDto,
    @Body() body: PostForSpecifiedBlogInputDto,
    @CurrentUserId() userId: string,
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
  @Get('blogs/:id/posts')
  async getPostsForSpecifiedBlog(
    @Param() params: GetBlogParamsDto,
    @Query() query: PostsQueryDto,
    @CurrentUserId() userId: string,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(query, params.id, userId),
    );

    if (!posts) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return posts;
  }

  @UseGuards(JwtAuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  async updateSpecifiedPost(
    @Param() params: UpdatePostParamsDto,
    @Body() body: UpdatePostInputDto,
    @CurrentUserId() userId: string,
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
  @Delete('blogs/:blogId/posts/:postId')
  async deleteSpecifiedPost(
    @Param() params: DeletePostParamsDto,
    @CurrentUserId() userId,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new DeletePostWithCheckingCommand(userId, params.blogId, params.postId),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('blogs/:id')
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
  @Delete('blogs/:id')
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
