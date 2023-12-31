import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PostsQueryDto } from '../../application/dto/posts/posts.query.dto';
import { PostParamsDto } from '../../application/dto/posts/post.params.dto';
import { CommentParamsDto } from '../../application/dto/comments/comment.params.dto';
import { CommentsQueryDto } from '../../application/dto/comments/comments.query.dto';
import { RouterPaths } from '../../constants/router.paths';
import { CommentInputDto } from '../../application/dto/comments/comment.input.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChangeLikeCountDto } from '../../application/dto/likes/change-like-count.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePostLikesCountCommand } from '../../domain/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsCommand } from '../../domain/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdCommand } from '../../domain/posts/use-cases/get-post-by-id-use-case';
import { CreateCommentCommand } from '../../domain/comments/use-cases/create-comment-use-case';
import { GetSortedCommentsCommand } from '../../domain/comments/use-cases/get-sorted-comments-use-case';
import { exceptionHandler } from '../../utils/errors/exception.handler';
import { UserIdFromHeaders } from '../../auth/user-id-from-headers.decorator';

@Controller(RouterPaths.posts)
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  async getPosts(
    @Query() query: PostsQueryDto,
    @UserIdFromHeaders() userId: string,
  ) {
    return await this.commandBus.execute(
      new GetSortedPostsCommand(query, userId),
    );
  }

  @Get(':id')
  async getPost(
    @Param() params: PostParamsDto,
    @UserIdFromHeaders() userId: string,
  ) {
    const foundPost = await this.commandBus.execute(
      new GetPostByIdCommand(params.id, userId),
    );

    if (!foundPost) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundPost;
  }

  @Get(':id/comments')
  async getComments(
    @Param() params: CommentParamsDto,
    @Query() query: CommentsQueryDto,
    @UserIdFromHeaders() userId: string,
  ) {
    const foundComments = await this.commandBus.execute(
      new GetSortedCommentsCommand(params.id, query, userId),
    );

    if (!foundComments) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundComments;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Param() params: CommentParamsDto,
    @Body() body: CommentInputDto,
    @CurrentUserId() currentUserId,
  ) {
    const newComment = await this.commandBus.execute(
      new CreateCommentCommand(body.content, params.id, currentUserId),
    );

    if (!newComment) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return newComment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
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
