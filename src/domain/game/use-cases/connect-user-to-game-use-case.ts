import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { GameViewType } from '../../../types/game.types';
import { Player } from '../../../entities/game/Player.entity';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { Game } from '../../../entities/game/Game.entity';
import { QuestionsRepository } from '../../../infrastructure/repositories/questions/questions.repository';
import { GameStatus } from '../../../types/general.types';
import { GamesRepository } from '../../../infrastructure/repositories/game/games.repository';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../exception.handler';

export class ConnectUserToGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserToGameCommand)
export class ConnectUserToGameUseCase
  implements ICommandHandler<ConnectUserToGameCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly gamesRepository: GamesRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    command: ConnectUserToGameCommand,
  ): Promise<GameViewType | null> {
    const { userId } = command;

    const user = await this.usersRepository.fetchAllUserDataById(userId);

    const isActiveGameExist = await this.gamesRepository.findActiveGameByUserId(
      user.id,
    );

    if (isActiveGameExist) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    let game = await this.gamesRepository.findPendingGame();
    const player = Player.create(user);

    if (game) {
      Game.connectSecondPlayer(game, player);
    } else {
      const questions =
        await this.questionsRepository.takeBunchRandomQuestions(5);

      game = Game.create(player, questions);
    }

    await this.dataSourceRepository.save(player);
    const savedGame = await this.dataSourceRepository.save(game);

    return {
      id: savedGame.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: savedGame.firstPlayer.user.id,
          login: savedGame.firstPlayer.user.login,
        },
        score: savedGame.firstPlayer.score,
      },
      secondPlayerProgress:
        savedGame.status !== GameStatus.PendingSecondPlayer
          ? {
              answers: [],
              player: { id: user.id, login: user.login },
              score: savedGame.secondPlayer.score,
            }
          : null,
      questions:
        savedGame.status !== GameStatus.PendingSecondPlayer
          ? savedGame.questions.map((q) => {
              return { id: q.id, body: q.body };
            })
          : null,
      status: savedGame.status,
      pairCreatedDate: savedGame.pairCreatedDate,
      startGameDate: savedGame.startGameDate ?? null,
      finishGameDate: null,
    };
  }
}
