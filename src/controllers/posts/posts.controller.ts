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
import { GetSortedPostsModel } from './models/get-sorted-posts.model';
import { GetPostModel } from './models/get-post.model';
import { NewPostDto } from '../../dtos/posts/new-post.dto';
import { UriParamsPostIdModel } from './models/uri-params-post-id.model';
import { DeletePostModel } from './models/delete-post.model';
import { UriParamsCommentModel } from '../comments/models/uri-params-comment.model';
import { GetSortedCommentsModel } from '../comments/models/get-sorted-comments.model';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { UpdateCommentDto } from '../../dtos/comments/update-comment.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChangeLikeCountDto } from '../../dtos/likes/change-like-count.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostCommand } from '../../domains/posts/use-cases/update-post-use-case';
import { CreatePostCommand } from '../../domains/posts/use-cases/create-post-use-case';
import { ChangePostLikesCountCommand } from '../../domains/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsCommand } from '../../domains/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdCommand } from '../../domains/posts/use-cases/get-post-by-id-use-case';
import { DeletePostCommand } from '../../domains/posts/use-cases/delete-post-use-case';
import { CreateCommentCommand } from '../../domains/comments/use-cases/create-comment-use-case';
import { GetSortedCommentsCommand } from '../../domains/comments/use-cases/get-sorted-comments-use-case';

@Controller()
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(`${RouterPaths.posts}`)
  async getPosts(@Query() query: GetSortedPostsModel, @Req() req: Request) {
    return await this.commandBus.execute(
      new GetSortedPostsCommand(query, req.headers?.authorization),
    );
  }

  @Get(`${RouterPaths.posts}/:id`)
  async getPost(
    @Param() params: GetPostModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundPost = await this.commandBus.execute(
      new GetPostByIdCommand(params.id, req.headers?.authorization),
    );

    !foundPost ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundPost);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.posts}`)
  async createPost(@Body() body: NewPostDto, @Res() res: Response) {
    const post = await this.commandBus.execute(new CreatePostCommand(body));

    !post ? res.sendStatus(HttpStatus.BAD_REQUEST) : res.send(post);
  }

  @Get(`${RouterPaths.posts}/:id/comments`)
  async getComments(
    @Param() params: UriParamsCommentModel,
    @Query() query: GetSortedCommentsModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundComments = await this.commandBus.execute(
      new GetSortedCommentsCommand(
        params.id,
        query,
        req.headers?.authorization,
      ),
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
    res.sendStatus(
      await this.commandBus.execute(new UpdatePostCommand(params.id, body)),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.posts}/:id/comments`)
  async createComment(
    @Param() params: UriParamsCommentModel,
    @Body() body: UpdateCommentDto,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    const newComment = await this.commandBus.execute(
      new CreateCommentCommand(body.content, params.id, currentUserId),
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
    res.sendStatus(
      await this.commandBus.execute(
        new ChangePostLikesCountCommand(
          params.id,
          body.likeStatus,
          currentUserId,
        ),
      ),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.posts}/:id`)
  async deleteUser(@Param() params: DeletePostModel, @Res() res: Response) {
    res.sendStatus(
      await this.commandBus.execute(new DeletePostCommand(params.id)),
    );
  }
}
