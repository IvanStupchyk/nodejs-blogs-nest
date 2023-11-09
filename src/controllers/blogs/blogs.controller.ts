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
import { GetSortedBlogsModel } from './models/GetSortedBlogsModel';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query.repository';
import { NewBlogDto } from './models/New.blog.dto';
import { BlogsService } from '../../domains/blogs/blogs.service';
import { GetBlogModel } from './models/GetBlogModel';
import { Response, Request } from 'express';
import { URIParamsBlogIdModel } from './models/URIParamsBlogIdModel';
import { UpdateBlogModel } from './models/UpdateBlogModel';
import { DeleteBlogModel } from './models/DeleteBlogModel';
import { PostForSpecificBlogDto } from '../posts/models/Post.for.specific.blog.dto';
import { PostsService } from '../../domains/posts/posts.service';
import { GetSortedPostsModel } from '../posts/models/GetSortedPostsModel';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts.query.repository';
import { ApiRequestService } from '../../application/api.request.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtService } from '../../application/jwt.service';

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
  @Get('blogs')
  async getBlogs(@Query() params: GetSortedBlogsModel, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post('blogs')
  async createBlog(@Body() body: NewBlogDto) {
    const { name, websiteUrl, description } = body;
    return await this.blogsService.createBlog(name, description, websiteUrl);
  }

  @UseGuards(BasicAuthGuard)
  @Post('blogs/:id/posts')
  async createPostForSpecifiedBlog(
    @Param() params: URIParamsBlogIdModel,
    @Body() body: PostForSpecificBlogDto,
    @Res() res: Response,
  ) {
    const post = await this.postsService.createPostForSpecifiedBlog(
      body,
      params.id,
    );

    !post ? res.sendStatus(HttpStatus.BAD_REQUEST) : res.send(post);
  }

  @Get('blogs/:id')
  async getCurrentBlog(@Param() params: GetBlogModel, @Res() res: Response) {
    const foundBlog = await this.blogsService.findBlogById(params.id);

    !foundBlog ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundBlog);
  }

  @Get('blogs/:id/posts')
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
  @Put('blogs/:id')
  async updateBlog(
    @Param() params: URIParamsBlogIdModel,
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
  @Delete('blogs/:id')
  async deleteBlog(@Param() params: DeleteBlogModel, @Res() res: Response) {
    const isBlogExist = await this.blogsService.deleteBlog(params.id);

    res.sendStatus(!isBlogExist ? HttpStatus.NOT_FOUND : HttpStatus.NO_CONTENT);
  }
}
