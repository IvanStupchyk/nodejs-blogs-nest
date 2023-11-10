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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { PostsService } from '../../domains/posts/posts.service';
import { GetSortedPostsModel } from './models/get-sorted-posts.model';
import { GetPostModel } from './models/get-post.model';
import { NewPostDto } from './models/new-post.dto';
import { UriParamsPostIdModel } from './models/uri-params-post-id.model';
import { DeletePostModel } from './models/delete-post.model';
import { UriParamsCommentModel } from '../comments/models/uri-params-comment.model';
import { CommentsService } from '../../domains/comments/comments.service';
import { GetSortedCommentsModel } from '../comments/models/get-sorted-comments.model';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { UpdateCommentDto } from '../comments/models/update-comment.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { ObjectId } from 'mongodb';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HTTP_STATUSES } from '../../utils/utils';
import { ChangeLikeCountDto } from './models/change-like-count.dto';

@Controller()
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get(`${RouterPaths.posts}`)
  async getPosts(@Query() query: GetSortedPostsModel, @Req() req: Request) {
    return await this.postsService.getSortedPosts(
      query,
      req.headers?.authorization,
    );
  }

  @Get(`${RouterPaths.posts}/:id`)
  async getPost(
    @Param() params: GetPostModel,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const foundPost = await this.postsService.getPostById(
      params.id,
      req.headers?.authorization,
    );

    !foundPost ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundPost);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.posts}`)
  async createPost(@Body() body: NewPostDto, @Res() res: Response) {
    const post = await this.postsService.createPost(body);

    !post ? res.sendStatus(HttpStatus.BAD_REQUEST) : res.send(post);
  }

  @Get(`${RouterPaths.posts}/:id/comments`)
  async getComments(
    @Param() params: UriParamsCommentModel,
    @Query() query: GetSortedCommentsModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundComments = await this.commentsService.getSortedComments(
      params.id,
      query,
      req.headers?.authorization,
    );

    !foundComments
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.send(foundComments);
  }

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.posts}/:id`)
  async updatePost(
    @Param() params: UriParamsPostIdModel,
    @Body() body: NewPostDto,
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

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.posts}/:id/comments`)
  async createComment(
    @Param() params: UriParamsCommentModel,
    @Body() body: UpdateCommentDto,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    const newComment = await this.commentsService.createComment(
      body.content,
      params.id,
      currentUserId,
    );

    if (typeof newComment === 'object') {
      res.status(HttpStatus.CREATED).send(newComment);
    } else {
      res.sendStatus(newComment);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(`${RouterPaths.posts}/:id/like-status`)
  async changeLikeCount(
    @Param() params: UriParamsPostIdModel,
    @Body() body: ChangeLikeCountDto,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    const isLikesCountChanges = await this.postsService.changeLikesCount(
      params.id,
      body.likeStatus,
      new ObjectId(currentUserId),
    );

    res.sendStatus(
      isLikesCountChanges
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.NOT_FOUND_404,
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.posts}/:id`)
  async deleteUser(@Param() params: DeletePostModel, @Res() res: Response) {
    const isPostExist = await this.postsService.deletePost(params.id);

    !isPostExist
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
