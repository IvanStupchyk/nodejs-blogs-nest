import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameViewType } from '../../../types/game.types';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { isUUID } from '../../../utils/utils';
import { GameStatus } from '../../../types/general.types';
import { GamesQueryRepository } from '../../../infrastructure/repositories/game/games-query.repository';

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
  constructor(private readonly gamesQueryRepository: GamesQueryRepository) {}

  async execute(
    command: FindSpecifiedGameCommand,
  ): Promise<GameViewType | null> {
    const { userId, gameId } = command;
    if (!isUUID(gameId)) {
      exceptionHandler(HttpStatus.BAD_REQUEST);
    }

    const game = await this.gamesQueryRepository.findCurrentGame(gameId);

    if (!game) {
      exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (
      game.firstPlayer.user.id !== userId &&
      game.secondPlayer?.user?.id !== userId
    ) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: game.firstPlayer.answers
          ? game.firstPlayer.answers.map((a) => {
              return {
                questionId: a.question.id,
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
        game.status === GameStatus.Active || game.status === GameStatus.Finished
          ? {
              answers: game.secondPlayer.answers
                ? game.secondPlayer.answers.map((a) => {
                    return {
                      questionId: a.question.id,
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
        game.status === GameStatus.Active || game.status === GameStatus.Finished
          ? game.questions.map((q) => {
              return { id: q.id, body: q.body };
            })
          : null,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
