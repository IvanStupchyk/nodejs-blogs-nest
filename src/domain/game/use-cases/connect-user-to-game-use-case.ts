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
    // console.log('existingGame', isActiveGameExist);
    if (isActiveGameExist && isActiveGameExist.status !== GameStatus.Finished) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const pendingGame = await this.gamesRepository.findPendingGame();
    // console.log('pendingGame', pendingGame);

    if (pendingGame) {
      // console.log('pendingGame', pendingGame);
      const secondPlayer = new Player();
      secondPlayer.user = user;
      await this.dataSourceRepository.save(secondPlayer);
      pendingGame.secondPlayer = secondPlayer;
      pendingGame.status = GameStatus.Active;
      pendingGame.startGameDate = new Date();
      const savedGame = await this.dataSourceRepository.save(pendingGame);

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
        secondPlayerProgress: {
          answers: [],
          player: { id: user.id, login: user.login },
          score: savedGame.secondPlayer.score,
        },
        questions: savedGame.questions.map((q) => {
          return { id: q.id.toString(), body: q.body };
        }),
        status: savedGame.status,
        pairCreatedDate: savedGame.pairCreatedDate,
        startGameDate: savedGame.startGameDate,
        finishGameDate: null,
      };
    } else {
      const questions =
        await this.questionsRepository.takeBunchRandomQuestions(5);

      const firstPlayer = new Player();
      firstPlayer.user = user;
      await this.dataSourceRepository.save(firstPlayer);

      const newGame = new Game();
      newGame.firstPlayer = firstPlayer;
      newGame.questions = questions;
      newGame.status = GameStatus.PendingSecondPlayer;

      const savedGame = await this.dataSourceRepository.save(newGame);

      return {
        id: savedGame.id,
        firstPlayerProgress: {
          answers: [],
          player: { id: user.id, login: user.login },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: savedGame.status,
        pairCreatedDate: savedGame.pairCreatedDate,
        startGameDate: null,
        finishGameDate: null,
      };
    }
  }
}
