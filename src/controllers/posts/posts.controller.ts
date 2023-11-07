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
import { Response } from 'express';
import { PostsQueryRepository } from '../../repositories/posts.query.repository';
import { PostsService } from '../../domains/posts/posts.service';
import { GetSortedPostsModel } from './models/GetSortedPostsModel';
import { GetPostModel } from './models/GetPostModel';
import { CreatePostModel } from './models/CreatePostModel';
import { UpdatePostModel } from './models/UpdatePostModel';
import { URIParamsPostIdModel } from './models/URIParamsPostIdModel';
import { DeletePostModel } from './models/DeletePostModel';
import { URIParamsCommentModel } from '../comments/models/URI.params.comment.model';
import { CommentsService } from '../../domains/comments/comments.service';
import { GetSortedCommentsModel } from '../comments/models/Get.sorted.comments.model';

@Controller()
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get('posts')
  async getPosts(@Query() query: GetSortedPostsModel) {
    return await this.postsService.getSortedPosts(query, undefined);
  }

  @Get('posts/:id')
  async getPost(@Param() params: GetPostModel, @Res() res: Response) {
    const foundPost = await this.postsService.getPostById(params.id, undefined);

    !foundPost ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundPost);
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param() params: URIParamsCommentModel,
    @Query() query: GetSortedCommentsModel,
    @Res() res: Response,
  ) {
    const foundComments = await this.commentsService.getSortedComments(
      params.id,
      query,
      undefined,
    );

    !foundComments
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.send(foundComments);
  }

  @Post('posts')
  async createPost(@Body() body: CreatePostModel, @Res() res: Response) {
    const { title, content, shortDescription, blogId } = body;
    const post = await this.postsService.createPost(
      title,
      content,
      shortDescription,
      blogId,
    );

    !post ? res.sendStatus(HttpStatus.BAD_REQUEST) : res.send(post);
  }

  @Put('posts/:id')
  async updatePost(
    @Param() params: URIParamsPostIdModel,
    @Body() body: UpdatePostModel,
    @Res() res: Response,
  ) {
    const { title, content, shortDescription, blogId } = body;

    const updatedPost = await this.postsService.updatePostById(
      params.id,
      title,
      content,
      shortDescription,
      blogId,
    );

    !updatedPost
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Delete('posts/:id')
  async deleteUser(@Param() params: DeletePostModel, @Res() res: Response) {
    const isPostExist = await this.postsService.deletePost(params.id);

    !isPostExist
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
