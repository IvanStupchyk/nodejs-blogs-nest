import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameViewType } from '../../../types/game.types';
import { GamesRepository } from '../../../infrastructure/repositories/game/games.repository';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../exception.handler';
import { isUUID } from '../../../utils/utils';
import { GameStatus } from '../../../types/general.types';

export class FindSpecifiedGameCommand {
  constructor(
    public userId: string,
    public gameId: string,
  ) {}
}

@CommandHandler(FindSpecifiedGameCommand)
export class FindSpecifiedGameUseCase
  implements ICommandHandler<FindSpecifiedGameCommand>
{
  constructor(private readonly gamesRepository: GamesRepository) {}

  async execute(
    command: FindSpecifiedGameCommand,
  ): Promise<GameViewType | null> {
    const { userId, gameId } = command;
    if (!isUUID(gameId)) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    const game = await this.gamesRepository.findCurrentGame(gameId);

    if (
      game.firstPlayer.user.id !== userId &&
      game.secondPlayer.user.id !== userId
    ) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    if (!game) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: game.firstPlayer.answers
          ? game.firstPlayer.answers.map((a) => {
              return {
                questionId: a.id,
                answerStatus: a.answerStatus,
                addedAt: a.addedAt,
              };
            })
          : [],
        player: {
          id: game.firstPlayer.user.id,
          login: game.firstPlayer.user.login,
        },
        score: game.firstPlayer.score,
      },
      secondPlayerProgress:
        game.status === GameStatus.Active
          ? {
              answers: game.secondPlayer.answers
                ? game.secondPlayer.answers.map((a) => {
                    return {
                      questionId: a.id,
                      answerStatus: a.answerStatus,
                      addedAt: a.addedAt,
                    };
                  })
                : [],
              player: {
                id: game.secondPlayer.user.id,
                login: game.secondPlayer.user.login,
              },
              score: game.secondPlayer.score,
            }
          : null,
      status: game.status,
      questions:
        game.status === GameStatus.Active
          ? game.questions.map((q) => {
              return { id: q.id.toString(), body: q.body };
            })
          : null,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
