import { CommandHandler } from '@nestjs/cqrs';
import { AnswerType } from '../../../types/game.types';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../utils/errors/exception.handler';
import { GameStatus } from '../../../types/general.types';
import { Answer } from '../../../entities/game/Answer.entity';
import { Game } from '../../../entities/game/Game.entity';
import add from 'date-fns/add';
import { TransactionUseCase } from '../../transaction/use-case/transaction-use-case';
import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GamesTransactionRepository } from '../../../infrastructure/repositories/game/games-transaction.repository';
import { TransactionsRepository } from '../../../infrastructure/repositories/transactions/transactions.repository';

export class AnswerToQuestionCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerToQuestionCommand)
export class AnswerToQuestionUseCase extends TransactionUseCase<
  AnswerToQuestionCommand,
  AnswerType | null
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly gamesTransactionRepository: GamesTransactionRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async mainLogic(command: AnswerToQuestionCommand, manager: EntityManager) {
    const { userId, answer } = command;

    const activeGame =
      await this.gamesTransactionRepository.findGameInActiveStatusByUserId(
        userId,
        manager,
      );

    if (!activeGame) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    let player = activeGame.firstPlayer;
    if (activeGame.secondPlayer.user.id === userId) {
      player = activeGame.secondPlayer;
    }

    if (player.answers.length >= 5) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const answersCountUser1 = activeGame.firstPlayer.answers.length;
    const answersCountUser2 = activeGame.secondPlayer.answers.length;
    const currentQuestionIndex = player.answers.length;
    const currentQuestion = activeGame.questions[currentQuestionIndex];

    const newAnswer = Answer.create(player, currentQuestion);

    await this._addAdditionalPoint(activeGame, manager);

    if (currentQuestion.correctAnswers.includes(answer)) {
      Answer.correctAnswer(newAnswer, player);
    } else {
      Answer.incorrectAnswer(newAnswer);
    }

    if (
      (answersCountUser1 === 4 && player.id === activeGame.firstPlayer.id) ||
      (answersCountUser2 === 4 && player.id === activeGame.secondPlayer.id)
    ) {
      activeGame.timeToFinishGame = add(new Date(), {
        seconds: 9,
      });
    }

    if (
      (answersCountUser1 === 5 && answersCountUser2 === 4) ||
      (answersCountUser1 === 4 && answersCountUser2 === 5)
    ) {
      activeGame.status = GameStatus.Finished;
      activeGame.finishGameDate = new Date();
      activeGame.firstPlayer.finished = true;
      activeGame.secondPlayer.finished = true;
      await this.transactionsRepository.save(activeGame.firstPlayer, manager);
      await this.transactionsRepository.save(activeGame.secondPlayer, manager);
    }

    await this.transactionsRepository.save(player, manager);
    await this.transactionsRepository.save(newAnswer, manager);
    await this.transactionsRepository.save(activeGame, manager);

    return {
      questionId: newAnswer.question.id,
      answerStatus: newAnswer.answerStatus,
      addedAt: newAnswer.addedAt,
    };
  }

  async execute(command: AnswerToQuestionCommand) {
    return super.execute(command);
  }
  async _addAdditionalPoint(activeGame: Game, manager: EntityManager) {
    if (
      (activeGame.firstPlayer.answers.length === 5 &&
        activeGame.secondPlayer.answers.length === 4) ||
      (activeGame.firstPlayer.answers.length === 4 &&
        activeGame.secondPlayer.answers.length === 5)
    ) {
      let fasterPlayer = activeGame.firstPlayer;
      if (activeGame.secondPlayer.answers.length === 5) {
        fasterPlayer = activeGame.secondPlayer;
      }

      if (fasterPlayer.score !== 0) {
        fasterPlayer.score = ++fasterPlayer.score;
      }

      await this.transactionsRepository.save(fasterPlayer, manager);
    }
  }
}
