import {
  Body,
  Controller,
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
import { PostsQueryDto } from '../dto/posts/posts.query.dto';
import { PostParamsDto } from '../dto/posts/post.params.dto';
import { CommentParamsDto } from '../dto/comments/comment.params.dto';
import { CommentsQueryDto } from '../dto/comments/comments.query.dto';
import { RouterPaths } from '../constants/router.paths';
import { CommentInputDto } from '../dto/comments/comment.input.dto';
import { CurrentUserId } from '../auth/current-user-param.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeLikeCountDto } from '../dto/likes/change-like-count.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePostLikesCountCommand } from '../domains/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsCommand } from '../domains/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdCommand } from '../domains/posts/use-cases/get-post-by-id-use-case';
import { CreateCommentCommand } from '../domains/comments/use-cases/create-comment-use-case';
import { GetSortedCommentsCommand } from '../domains/comments/use-cases/get-sorted-comments-use-case';

@Controller()
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Get(`${RouterPaths.posts}`)
  async getPosts(@Query() query: PostsQueryDto, @Req() req: Request) {
    return await this.commandBus.execute(
      new GetSortedPostsCommand(query, req.headers?.authorization),
    );
  }

  @Get(`${RouterPaths.posts}/:id`)
  async getPost(
    @Param() params: PostParamsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundPost = await this.commandBus.execute(
      new GetPostByIdCommand(params.id, req.headers?.authorization),
    );

    !foundPost ? res.sendStatus(HttpStatus.NOT_FOUND) : res.send(foundPost);
  }

  @Get(`${RouterPaths.posts}/:id/comments`)
  async getComments(
    @Param() params: CommentParamsDto,
    @Query() query: CommentsQueryDto,
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

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.posts}/:id/comments`)
  async createComment(
    @Param() params: CommentParamsDto,
    @Body() body: CommentInputDto,
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
    @Param() params: PostParamsDto,
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
}
