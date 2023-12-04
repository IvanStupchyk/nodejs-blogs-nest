import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { exceptionHandler } from '../../exception.handler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { GamesQueryRepository } from '../../infrastructure/repositories/game/games-query.repository';
import { GetGameParamsDto } from '../../dto/game/get-game.params.dto';
import { ConnectUserToGameCommand } from '../../domain/game/use-cases/connect-user-to-game-use-case';
import { AnswerToQuestionInputDto } from '../../dto/game/answer-to-question.input.dto';
import { FindSpecifiedGameCommand } from '../../domain/game/use-cases/find-specified-game-use-case';

@Controller(RouterPaths.game)
export class GameController {
  constructor(
    private readonly gamesQueryRepository: GamesQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-current')
  async getCurrentGame(@CurrentUserId() currentUserId) {
    const game =
      await this.gamesQueryRepository.findGameForSpecifiedUser(currentUserId);

    if (!game) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return game;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSpecifiedGame(
    @CurrentUserId() currentUserId,
    @Param() params: GetGameParamsDto,
  ) {
    return await this.commandBus.execute(
      new FindSpecifiedGameCommand(currentUserId, params.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('connection')
  async connectToTheGame(@CurrentUserId() currentUserId) {
    return await this.commandBus.execute(
      new ConnectUserToGameCommand(currentUserId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-current/answers')
  async answerToQuestion(
    @Body() body: AnswerToQuestionInputDto,
    @CurrentUserId() currentUserId,
  ) {}
}
