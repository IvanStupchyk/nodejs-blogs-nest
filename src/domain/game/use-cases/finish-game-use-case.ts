import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../../infrastructure/repositories/game/games.repository';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { Interval } from '@nestjs/schedule';
import { GameStatus } from '../../../types/general.types';

export class FinishGameCommand {
  constructor() {}
}

@CommandHandler(FinishGameCommand)
export class FinishGameUseCase implements ICommandHandler<FinishGameCommand> {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  @Interval(1000)
  async execute(): Promise<void | null> {
    const gamesToFinish =
      await this.gamesRepository.findGamesInActiveStatusToFinish();

    if (!gamesToFinish.length) return null;

    for (const game of gamesToFinish) {
      if (
        game.firstPlayer.answers.length === 5 &&
        game.firstPlayer.score !== 0
      ) {
        game.firstPlayer.score += 1;
      }

      if (
        game.secondPlayer.answers.length === 5 &&
        game.secondPlayer.score !== 0
      ) {
        game.secondPlayer.score += 1;
      }

      game.status = GameStatus.Finished;
      game.finishGameDate = new Date();
      game.firstPlayer.finished = true;
      game.secondPlayer.finished = true;

      await this.dataSourceRepository.save(game.firstPlayer);
      await this.dataSourceRepository.save(game.secondPlayer);
      await this.dataSourceRepository.save(game);
    }
  }
}
