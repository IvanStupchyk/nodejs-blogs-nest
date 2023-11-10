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
import { NewBlogDto } from './models/new-blog.dto';
import { BlogsService } from '../../domains/blogs/blogs.service';
import { GetBlogModel } from './models/get-blog.model';
import { Response, Request } from 'express';
import { UriParamsBlogIdModel } from './models/uri-params-blog-id.model';
import { UpdateBlogModel } from './models/update-blog.model';
import { DeleteBlogModel } from './models/delete-blog.model';
import { PostForSpecificBlogDto } from '../posts/models/post-for-specific-blog.dto';
import { PostsService } from '../../domains/posts/posts.service';
import { GetSortedPostsModel } from '../posts/models/get-sorted-posts.model';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { ApiRequestService } from '../../application/api-request.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtService } from '../../application/jwt.service';
import { RouterPaths } from '../../constants/router.paths';

@Controller()
export class BlogController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly apiRequestCounter: ApiRequestService,
    private readonly jwtService: JwtService,
  ) {}
  @Get(`${RouterPaths.blogs}`)
  async getBlogs(@Query() params: GetSortedBlogsModel, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.blogs}`)
  async createBlog(@Body() body: NewBlogDto) {
    const { name, websiteUrl, description } = body;
    return await this.blogsService.createBlog(name, description, websiteUrl);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.blogs}/:id/posts`)
  async createPostForSpecifiedBlog(
    @Param() params: UriParamsBlogIdModel,
    @Body() body: PostForSpecificBlogDto,
    @Res() res: Response,
  ) {
    const post = await this.postsService.createPostForSpecifiedBlog(
      body,
      params.id,
    );

    !post ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(post);
  }

  @Get(`${RouterPaths.blogs}/:id`)
  async getCurrentBlog(@Param() params: GetBlogModel, @Res() res: Response) {
    const foundBlog = await this.blogsService.findBlogById(params.id);

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
    @Body() body: UpdateBlogModel,
    @Res() res: Response,
  ) {
    const { name, websiteUrl, description } = body;

    const updatedBlog = await this.blogsService.updateBlogById(
      params.id,
      name,
      description,
      websiteUrl,
    );

    !updatedBlog
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.blogs}/:id`)
  async deleteBlog(@Param() params: DeleteBlogModel, @Res() res: Response) {
    const isBlogExist = await this.blogsService.deleteBlog(params.id);

    res.sendStatus(!isBlogExist ? HttpStatus.NOT_FOUND : HttpStatus.NO_CONTENT);
  }
}
