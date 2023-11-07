import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CommentsService } from '../../domains/comments/comments.service';
import { GetCommentModel } from './models/Get.comment.model';
import { UpdateCommentModel } from './models/Update.comment.model';
import { URIParamsCommentModel } from './models/URI.params.comment.model';
import { UpdateLikesModel } from './models/Update.likes.model';
import { DeleteCommentModel } from './models/Delete.comment.model';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Get('comments/:id')
  async getCurrentBlog(@Param() params: GetCommentModel, @Res() res: Response) {
    const foundComment = await this.commentsService.findCommentById(
      params.id,
      undefined,
    );

    !foundComment
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.send(foundComment);
  }

  @Put('comments/:id')
  async updateBlog(
    @Param() params: URIParamsCommentModel,
    @Body() body: UpdateCommentModel,
    @Res() res: Response,
  ) {
    // const foundComment =
    //   await this.commentsService.findCommentByIdWithoutLikeStatus(params.id);

    // if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
    //   res.sendStatus(HttpStatus.FORBIDDEN);
    //   return;
    // }

    const isCommentUpdated = await this.commentsService.updateComment(
      body.content,
      params.id,
    );

    !isCommentUpdated
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Put('comments/:id/like-status')
  async likeComment(
    @Param() params: URIParamsCommentModel,
    @Body() body: UpdateLikesModel,
    @Res() res: Response,
  ) {
    // const isLikesCountChanges = await this.commentsService.changeLikesCount(
    //   params.id,
    //   body.likeStatus,
    //   new ObjectId(user!.id),
    // );
    const isLikesCountChanges = false;
    !isLikesCountChanges
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param() params: DeleteCommentModel,
    @Res() res: Response,
  ) {
    // const foundComment =
    //   await this.commentsService.findCommentByIdWithoutLikeStatus(params.id);

    // if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
    //   res.sendStatus(HttpStatus.FORBIDDEN);
    //   return;
    // }

    const isCommentDeleted = await this.commentsService.deleteComment(
      params.id,
    );
    res.sendStatus(
      !isCommentDeleted ? HttpStatus.NOT_FOUND : HttpStatus.NO_CONTENT,
    );
  }
}
