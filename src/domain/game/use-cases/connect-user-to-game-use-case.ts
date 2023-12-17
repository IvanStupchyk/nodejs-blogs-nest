import { CommandHandler } from '@nestjs/cqrs';
import { GameViewType } from '../../../types/game.types';
import { Player } from '../../../entities/game/Player.entity';
import { Game } from '../../../entities/game/Game.entity';
import { GameStatus } from '../../../types/general.types';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../exception.handler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';
import { GamesTransactionRepository } from '../../../infrastructure/repositories/game/games-transaction.repository';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { UsersTransactionRepository } from '../../../infrastructure/repositories/users/users.transaction.repository';
import { QuestionsTransactionRepository } from '../../../infrastructure/repositories/questions/questions-transaction.repository';

export class ConnectUserToGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserToGameCommand)
export class ConnectUserToGameUseCase extends TransactionUseCase<
  ConnectUserToGameCommand,
  GameViewType | null
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly gamesTransactionRepository: GamesTransactionRepository,
    private readonly usersTransactionRepository: UsersTransactionRepository,
    private readonly questionsTransactionRepository: QuestionsTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(
    command: ConnectUserToGameCommand,
    manager: EntityManager,
  ): Promise<GameViewType | null> {
    const { userId } = command;

    const user = await this.usersTransactionRepository.fetchAllUserDataById(
      userId,
      manager,
    );

    const isActiveGameExist =
      await this.gamesTransactionRepository.findActiveGameByUserId(
        user.id,
        manager,
      );

    if (isActiveGameExist) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    let game = await this.gamesTransactionRepository.findPendingGame(manager);
    const player = Player.create(user);

    if (game) {
      Game.connectSecondPlayer(game, player);
    } else {
      const questions =
        await this.questionsTransactionRepository.takeBunchRandomQuestions(
          5,
          manager,
        );

      game = Game.create(player, questions);
    }

    await this.transactionsRepository.save(player, manager);
    const savedGame = await this.transactionsRepository.save(game, manager);

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

  async execute(command: ConnectUserToGameCommand) {
    return super.execute(command);
  }
}
