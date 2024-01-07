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
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
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
