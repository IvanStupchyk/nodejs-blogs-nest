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
import { GetCommentModel } from './models/get-comment.model';
import { UpdateCommentDto } from '../../dtos/comments/update-comment.dto';
import { UriParamsCommentModel } from './models/uri-params-comment.model';
import { DeleteCommentModel } from './models/delete-comment.model';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { ObjectId } from 'mongodb';
import { ChangeLikeCountDto } from '../../dtos/likes/change-like-count.dto';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../../domains/comments/use-cases/update-comment-use-case';
import { GetCommentByIdCommand } from '../../domains/comments/use-cases/get-comment-by-id-use-case';
import { ChangeCommentLikesCountCommand } from '../../domains/comments/use-cases/change-comment-likes-count-use-case';
import { DeleteCommentCommand } from '../../domains/comments/use-cases/delete-comment-use-case';

@Controller()
export class CommentsController {
  constructor(private commandBus: CommandBus) {}
  @Get(`${RouterPaths.comments}/:id`)
  async getCurrentComment(
    @Param() params: GetCommentModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const foundComment = await this.commandBus.execute(
      new GetCommentByIdCommand(params.id, req.headers?.authorization),
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
    res.sendStatus(
      await this.commandBus.execute(
        new UpdateCommentCommand(body.content, params.id, currentUserId),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(`${RouterPaths.comments}/:id/like-status`)
  async likeComment(
    @Param() params: UriParamsCommentModel,
    @Body() body: ChangeLikeCountDto,
    @Res() res: Response,
    @CurrentUserId() currentUserId,
  ) {
    const isLikesCountChanges = await this.commandBus.execute(
      new ChangeCommentLikesCountCommand(
        params.id,
        body.likeStatus,
        new ObjectId(currentUserId),
      ),
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
    res.sendStatus(
      await this.commandBus.execute(
        new DeleteCommentCommand(params.id, currentUserId),
      ),
    );
  }
}
