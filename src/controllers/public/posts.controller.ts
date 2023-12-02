import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PostsQueryDto } from '../../dto/posts/posts.query.dto';
import { PostParamsDto } from '../../dto/posts/post.params.dto';
import { CommentParamsDto } from '../../dto/comments/comment.params.dto';
import { CommentsQueryDto } from '../../dto/comments/comments.query.dto';
import { RouterPaths } from '../../constants/router.paths';
import { CommentInputDto } from '../../dto/comments/comment.input.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChangeLikeCountDto } from '../../dto/likes/change-like-count.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePostLikesCountCommand } from '../../domain/posts/use-cases/change-post-likes-count-use-case';
import { GetSortedPostsCommand } from '../../domain/posts/use-cases/get-sorted-posts-use-case';
import { GetPostByIdCommand } from '../../domain/posts/use-cases/get-post-by-id-use-case';
import { CreateCommentCommand } from '../../domain/comments/use-cases/create-comment-use-case';
import { GetSortedCommentsCommand } from '../../domain/comments/use-cases/get-sorted-comments-use-case';
import { exceptionHandler } from '../../exception.handler';

@Controller()
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Get(`${RouterPaths.posts}`)
  async getPosts(@Query() query: PostsQueryDto, @Headers() headers: any) {
    return await this.commandBus.execute(
      new GetSortedPostsCommand(query, headers?.authorization),
    );
  }

  @Get(`${RouterPaths.posts}/:id`)
  async getPost(@Param() params: PostParamsDto, @Headers() headers: any) {
    const foundPost = await this.commandBus.execute(
      new GetPostByIdCommand(params.id, headers?.authorization),
    );

    if (!foundPost) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundPost;
  }

  @Get(`${RouterPaths.posts}/:id/comments`)
  async getComments(
    @Param() params: CommentParamsDto,
    @Query() query: CommentsQueryDto,
    @Headers() headers: any,
  ) {
    const foundComments = await this.commandBus.execute(
      new GetSortedCommentsCommand(params.id, query, headers?.authorization),
    );

    if (!foundComments) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundComments;
  }

  @UseGuards(JwtAuthGuard)
  @Post(`${RouterPaths.posts}/:id/comments`)
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
