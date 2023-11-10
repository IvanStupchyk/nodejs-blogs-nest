import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommentsService } from '../../domains/comments/comments.service';
import { GetCommentModel } from './models/get-comment.model';
import { UpdateCommentDto } from './models/update-comment.dto';
import { UriParamsCommentModel } from './models/uri-params-comment.model';
import { DeleteCommentModel } from './models/delete-comment.model';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { ObjectId } from 'mongodb';
import { ChangeLikeCountDto } from '../posts/models/change-like-count.dto';
import { RouterPaths } from '../../constants/router.paths';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Get(`${RouterPaths.comments}/:id`)
  async getCurrentComment(
    @Param() params: GetCommentModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundComment = await this.commentsService.findCommentById(
      params.id,
      req.headers?.authorization,
    );

    !foundComment
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.send(foundComment);
  }

  @UseGuards(JwtAuthGuard)
  @Put(`${RouterPaths.comments}/:id`)
  async updateComment(
    @Param() params: UriParamsCommentModel,
    @Body() body: UpdateCommentDto,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    const statusCode = await this.commentsService.updateComment(
      body.content,
      params.id,
      currentUserId,
    );

    res.sendStatus(statusCode);
  }

  @UseGuards(JwtAuthGuard)
  @Put(`${RouterPaths.comments}/:id/like-status`)
  async likeComment(
    @Param() params: UriParamsCommentModel,
    @Body() body: ChangeLikeCountDto,
    @Res() res: Response,
    @CurrentUserId() currentUserId,
  ) {
    const isLikesCountChanges = await this.commentsService.changeLikesCount(
      params.id,
      body.likeStatus,
      new ObjectId(currentUserId),
    );

    !isLikesCountChanges
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(`${RouterPaths.comments}/:id`)
  async deleteComment(
    @Param() params: DeleteCommentModel,
    @Res() res: Response,
    @CurrentUserId() currentUserId,
  ) {
    const statusCode = await this.commentsService.deleteComment(
      params.id,
      currentUserId,
    );
    res.sendStatus(statusCode);
  }
}
