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
} from '@nestjs/common';
import { GetSortedBlogsModel } from './models/GetSortedBlogsModel';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { CreateBlogModel } from './models/CreateBlogModel';
import { BlogsService } from '../../domains/blogs/blogs.service';
import { GetBlogModel } from './models/GetBlogModel';
import { Response } from 'express';
import { URIParamsBlogIdModel } from './models/URIParamsBlogIdModel';
import { UpdateBlogModel } from './models/UpdateBlogModel';
import { DeleteBlogModel } from './models/DeleteBlogModel';
import { CreatePostForSpecificBlogModel } from '../posts/models/CreatePostForSpecificBlogModel';
import { PostsService } from '../../domains/posts/posts.service';
import { ObjectId } from 'mongodb';
import { GetSortedPostsModel } from '../posts/models/GetSortedPostsModel';
import { PostsQueryRepository } from '../../repositories/posts.query.repository';

@Controller()
export class BlogController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get('blogs')
  async getBlogs(@Query() params: GetSortedBlogsModel) {
    return await this.blogsQueryRepository.getSortedBlogs(params);
  }

  @Post('blogs')
  async createBlog(@Body() body: CreateBlogModel) {
    const { name, websiteUrl, description } = body;
    return await this.blogsService.createBlog(name, description, websiteUrl);
  }

  @Post('blogs/:id/posts')
  async createPostForSpecifiedBlog(
    @Param() params: URIParamsBlogIdModel,
    @Body() body: CreatePostForSpecificBlogModel,
    @Res() res: Response,
  ) {
    const { title, content, shortDescription } = body;
    const blogId = params.id;

    const foundBlog = await this.blogsService.findBlogById(params.id);

    if (!foundBlog) {
      res.sendStatus(HttpStatus.NOT_FOUND);
      return;
    }

    const post = await this.postsService.createPost(
      title,
      content,
      shortDescription,
      new ObjectId(blogId),
    );

    res.send(post);
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
    @Res() res: Response,
  ) {
    const foundBlog = await this.blogsService.findBlogById(params.id);

    if (!foundBlog) {
      res.sendStatus(HttpStatus.NOT_FOUND);
    }

    let userId;
    // if (req.headers?.authorization) {
    //   const accessToken = req.headers.authorization.split(' ')[1];
    //   userId = await jwtService.getUserIdByAccessToken(accessToken);
    // }

    res.send(
      await this.postsQueryRepository.findPostsByIdForSpecificBlog(
        query,
        params.id,
        userId,
      ),
    );
  }

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

  @Delete('blogs/:id')
  async deleteBlog(@Param() params: DeleteBlogModel, @Res() res: Response) {
    const isBlogExist = await this.blogsService.deleteBlog(params.id);

    res.sendStatus(!isBlogExist ? HttpStatus.NOT_FOUND : HttpStatus.NO_CONTENT);
  }
}
