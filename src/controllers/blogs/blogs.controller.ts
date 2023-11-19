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
import { GetSortedBlogsModel } from './models/get-sorted-blogs.model';
import { BlogDto } from '../../dtos/blogs/blog.dto';
import { GetBlogModel } from './models/get-blog.model';
import { Response, Request } from 'express';
import { UriParamsBlogIdModel } from './models/uri-params-blog-id.model';
import { DeleteBlogModel } from './models/delete-blog.model';
import { PostForSpecificBlogDto } from '../../dtos/posts/post-for-specific-blog.dto';
import { GetSortedPostsModel } from '../posts/models/get-sorted-posts.model';
import { JwtService } from '../../infrastructure/jwt.service';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostForSpecifiedBlogCommand } from '../../domains/posts/use-cases/create-post-for-specified-blog-use-case';
import { CreateBlogCommand } from '../../domains/blogs/use-cases/create-blog-use-case';
import { UpdateBlogCommand } from '../../domains/blogs/use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../../domains/blogs/use-cases/delete-blog-use-case';
import { FindBlogByIdCommand } from '../../domains/blogs/use-cases/find-blog-by-id-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BlogsQuerySqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-query-sql.repository';
import { PostsQuerySqlRepository } from '../../infrastructure/repositories-raw-sql/posts-query-sql.repository';
import { UpdatePostModel } from './models/update-post.model';
import { UpdatePostDto } from '../../domains/posts/dto/update-post.dto';
import { UpdatePostWithCheckingCommand } from '../../domains/blogs/use-cases/update-post-with-checking-use-case';
import { UserIdFromGuard } from '../../utils/decorators/user-id-from-guard.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetPostsForSpecifiedBlogCommand } from '../../domains/posts/use-cases/get-posts-for-specified-blog-use-case';
import { DeletePostModel } from './models/delete-post.model';
import { DeletePostWithCheckingCommand } from '../../domains/blogs/use-cases/delete-post-with-checking-use-case';

@Controller()
export class BlogController {
  constructor(
    private readonly blogsQuerySqlRepository: BlogsQuerySqlRepository,
    private readonly postsQuerySqlRepository: PostsQuerySqlRepository,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @Get(`${RouterPaths.saBlogs}`)
  async getBlogsForSa(
    @Query() params: GetSortedBlogsModel,
    @UserIdFromGuard() userId,
  ) {
    return await this.blogsQuerySqlRepository.getSortedBlogs(params, userId);
  }

  @UseGuards(ThrottlerGuard)
  @Get(`${RouterPaths.blogs}`)
  async getBlogs(@Query() params: GetSortedBlogsModel) {
    return await this.blogsQuerySqlRepository.getSortedBlogs(params);
  }

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.saBlogs}`)
  async createBlog(@Body() body: BlogDto, @UserIdFromGuard() userId) {
    return await this.commandBus.execute(new CreateBlogCommand(userId, body));
  }

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.saBlogs}/:id/posts`)
  async createPostForSpecifiedBlog(
    @Param() params: UriParamsBlogIdModel,
    @Body() body: PostForSpecificBlogDto,
    @UserIdFromGuard() userId,
    @Res() res: Response,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostForSpecifiedBlogCommand(body, params.id, userId),
    );

    !post ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(post);
  }

  @Get(`${RouterPaths.blogs}/:id`)
  async getCurrentBlog(@Param() params: GetBlogModel, @Res() res: Response) {
    const foundBlog = await this.commandBus.execute(
      new FindBlogByIdCommand(params.id),
    );

    !foundBlog ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundBlog);
  }

  @UseGuards(JwtAuthGuard)
  @Get(`${RouterPaths.saBlogs}/:id/posts`)
  async getPostsForSpecifiedBlog(
    @Param() params: GetBlogModel,
    @Query() query: GetSortedPostsModel,
    @Req() req: Request,
    @UserIdFromGuard() userId,
    @Res() res: Response,
  ) {
    const posts = await this.commandBus.execute(
      new GetPostsForSpecifiedBlogCommand(query, params.id, userId),
    );

    !posts ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(posts);
  }

  @Get(`${RouterPaths.blogs}/:id/posts`)
  async getPostsForSpecifiedBlogForAllUsers(
    @Param() params: GetBlogModel,
    @Query() query: GetSortedPostsModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let userId;
    if (req.headers?.authorization) {
      const accessToken = req.headers.authorization.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }
    const posts =
      await this.postsQuerySqlRepository.findPostsByIdForSpecificBlog(
        query,
        params.id,
        userId,
      );
    !posts ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(posts);
  }

  @UseGuards(JwtAuthGuard)
  @Put(`${RouterPaths.saBlogs}/:blogId/posts/:postId`)
  async updateSpecifiedPost(
    @Param() params: UpdatePostModel,
    @Body() body: UpdatePostDto,
    @UserIdFromGuard() userId,
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
  @Delete(`${RouterPaths.saBlogs}/:blogId/posts/:postId`)
  async deleteSpecifiedPost(
    @Param() params: DeletePostModel,
    @UserIdFromGuard() userId,
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
  @Put(`${RouterPaths.saBlogs}/:id`)
  async updateBlog(
    @Param() params: UriParamsBlogIdModel,
    @Body() body: BlogDto,
    @UserIdFromGuard() userId,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new UpdateBlogCommand(body, userId, params.id),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(`${RouterPaths.saBlogs}/:id`)
  async deleteBlog(
    @Param() params: DeleteBlogModel,
    @Res() res: Response,
    @UserIdFromGuard() userId,
  ) {
    res.sendStatus(
      await this.commandBus.execute(new DeleteBlogCommand(params.id, userId)),
    );
  }
}
