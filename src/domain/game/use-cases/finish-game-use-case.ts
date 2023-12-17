import { CommandHandler } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';
import { GameStatus } from '../../../types/general.types';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { GamesTransactionRepository } from '../../../infrastructure/repositories/game/games-transaction.repository';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';

export class FinishGameCommand {
  constructor() {}
}

@CommandHandler(FinishGameCommand)
export class FinishGameUseCase extends TransactionUseCase<
  FinishGameCommand,
  void | null
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly gamesTransactionRepository: GamesTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: FinishGameCommand,
    manager: EntityManager,
  ): Promise<void | null> {
    const gamesToFinish =
      await this.gamesTransactionRepository.findGamesInActiveStatusToFinish(
        manager,
      );

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

      await this.transactionsRepository.save(game.firstPlayer, manager);
      await this.transactionsRepository.save(game.secondPlayer, manager);
      await this.transactionsRepository.save(game, manager);
    }
  }

  @Interval(1000)
  async execute(command: FinishGameCommand) {
    return super.execute(command);
  }
}
