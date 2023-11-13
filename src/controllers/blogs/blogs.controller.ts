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
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs-query.repository';
import { BlogDto } from '../../dtos/blogs/blog.dto';
import { GetBlogModel } from './models/get-blog.model';
import { Response, Request } from 'express';
import { UriParamsBlogIdModel } from './models/uri-params-blog-id.model';
import { DeleteBlogModel } from './models/delete-blog.model';
import { PostForSpecificBlogDto } from '../../dtos/posts/post-for-specific-blog.dto';
import { GetSortedPostsModel } from '../posts/models/get-sorted-posts.model';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { ApiRequestService } from '../../application/api-request.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtService } from '../../infrastructure/jwt.service';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostForSpecifiedBlogCommand } from '../../domains/posts/use-cases/create-post-for-specified-blog-use-case';
import { CreateBlogCommand } from '../../domains/blogs/use-cases/create-blog-use-case';
import { UpdateBlogCommand } from '../../domains/blogs/use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../../domains/blogs/use-cases/delete-blog-use-case';
import { FindBlogByIdCommand } from '../../domains/blogs/use-cases/find-blog-by-id-use-case';

@Controller()
export class BlogController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly apiRequestCounter: ApiRequestService,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}
  @Get(`${RouterPaths.blogs}`)
  async getBlogs(@Query() params: GetSortedBlogsModel, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.blogs}`)
  async createBlog(@Body() body: BlogDto) {
    return await this.commandBus.execute(new CreateBlogCommand(body));
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.blogs}/:id/posts`)
  async createPostForSpecifiedBlog(
    @Param() params: UriParamsBlogIdModel,
    @Body() body: PostForSpecificBlogDto,
    @Res() res: Response,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostForSpecifiedBlogCommand(body, params.id),
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

  @Get(`${RouterPaths.blogs}/:id/posts`)
  async getPostsForSpecifiedBlog(
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
    const posts = await this.postsQueryRepository.findPostsByIdForSpecificBlog(
      query,
      params.id,
      userId,
    );
    !posts ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(posts);
  }

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.blogs}/:id`)
  async updateBlog(
    @Param() params: UriParamsBlogIdModel,
    @Body() body: BlogDto,
    @Res() res: Response,
  ) {
    const isBlogUpdated = await this.commandBus.execute(
      new UpdateBlogCommand(body, params.id),
    );

    !isBlogUpdated
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.blogs}/:id`)
  async deleteBlog(@Param() params: DeleteBlogModel, @Res() res: Response) {
    // const isBlogExist = await this.blogsService.deleteBlog(params.id);
    const isBlogDeleted = await this.commandBus.execute(
      new DeleteBlogCommand(params.id),
    );

    res.sendStatus(
      !isBlogDeleted ? HttpStatus.NOT_FOUND : HttpStatus.NO_CONTENT,
    );
  }
}
