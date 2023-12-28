import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Put, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { GetCommentParamsDto } from "../../application/dto/comments/get-comment.params.dto";
import { CommentInputDto } from "../../application/dto/comments/comment.input.dto";
import { CommentParamsDto } from "../../application/dto/comments/comment.params.dto";
import { DeleteCommentParamsDto } from "../../application/dto/comments/delete-comment.params.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUserId } from "../../auth/current-user-param.decorator";
import { ChangeLikeCountDto } from "../../application/dto/likes/change-like-count.dto";
import { RouterPaths } from "../../constants/router.paths";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCommentCommand } from "../../domain/comments/use-cases/update-comment-use-case";
import { GetCommentByIdCommand } from "../../domain/comments/use-cases/get-comment-by-id-use-case";
import { ChangeCommentLikesCountCommand } from "../../domain/comments/use-cases/change-comment-likes-count-use-case";
import { DeleteCommentCommand } from "../../domain/comments/use-cases/delete-comment-use-case";
import { exceptionHandler } from "../../utils/errors/exception.handler";

@Controller(RouterPaths.comments)
export class CommentsController {
  constructor(private commandBus: CommandBus) {}

  @Get(':id')
  async getCurrentComment(
    @Param() params: GetCommentParamsDto,
    @Headers() headers: any,
  ) {
    const foundComment = await this.commandBus.execute(
      new GetCommentByIdCommand(params.id, headers?.authorization),
    );

    if (!foundComment) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return foundComment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateComment(
    @Param() params: CommentParamsDto,
    @Body() body: CommentInputDto,
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
  @Put(':id/like-status')
  async likeComment(
    @Param() params: CommentParamsDto,
    @Body() body: ChangeLikeCountDto,
    @Res() res: Response,
    @CurrentUserId() currentUserId,
  ) {
    res.sendStatus(
      await this.commandBus.execute(
        new ChangeCommentLikesCountCommand(
          params.id,
          body.likeStatus,
          currentUserId,
        ),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(
    @Param() params: DeleteCommentParamsDto,
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
