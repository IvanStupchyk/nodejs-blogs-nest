import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryDto } from '../../application/dto/blogs/blogs.query.dto';
import { PostsQueryDto } from '../../application/dto/posts/posts.query.dto';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { FindBlogByIdCommand } from '../../domain/blogs/use-cases/find-blog-by-id-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs-query.repository';
import { GetPostsForSpecifiedBlogCommand } from '../../domain/posts/use-cases/get-posts-for-specified-blog-use-case';
import { GetBlogParamsDto } from '../../application/dto/blogs/get-blog.params.dto';
import { exceptionHandler } from '../../utils/errors/exception.handler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BlogInputDto } from '../../application/dto/blogs/blog.input.dto';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { CreateBlogCommand } from '../../domain/blogs/use-cases/create-blog-use-case';
import { GetTelegramLinkCommand } from '../../domain/telegram/get-telegram-link-use-case';
import { PopulateBlogSubscriberDataCommand } from '../../domain/telegram/populate-blog-subscriber-data-use-case';

@Controller(RouterPaths.telegram)
export class TelegramController {
  constructor(private commandBus: CommandBus) {}

  @Post('webhook')
  @HttpCode(204)
  async getBlogs(@Body() payload: any) {
    if (!payload?.message) {
      return null;
    }
    console.log('payload', payload);
    if (payload.message.text.includes('/start')) {
      await this.commandBus.execute(
        new PopulateBlogSubscriberDataCommand(
          payload.message?.text,
          payload.message?.from.id,
        ),
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-bot-link')
  async getBotLink(@CurrentUserId() userId: string) {
    return await this.commandBus.execute(new GetTelegramLinkCommand(userId));
  }
}
