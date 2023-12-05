import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerType } from '../../../types/game.types';
import { GamesRepository } from '../../../infrastructure/repositories/game/games.repository';
import { HttpStatus } from '@nestjs/common';
import { exceptionHandler } from '../../../exception.handler';
import { AnswerStatus, GameStatus } from '../../../types/general.types';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { Answer } from '../../../entities/game/Answer.entity';

export class AnswerToQuestionCommand {
  constructor(
    public userId: string,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerToQuestionCommand)
export class AnswerToQuestionUseCase
  implements ICommandHandler<AnswerToQuestionCommand>
{
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: AnswerToQuestionCommand): Promise<AnswerType | null> {
    const { userId, answer } = command;

    const activeGame =
      await this.gamesRepository.findGameInActiveStatusByUserId(userId);
    // console.log('activeGame', activeGame);

    if (!activeGame) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    let player = activeGame.firstPlayer;

    if (activeGame.secondPlayer.user.id === userId) {
      player = activeGame.secondPlayer;
    }

    if (player.answers.length === 5) {
      exceptionHandler(HttpStatus.FORBIDDEN);
    }

    const currentQuestionIndex = player.answers.length;

    const currentQuestion = activeGame.questions[currentQuestionIndex];
    // console.log('activeGame.questions', activeGame.questions);
    const newAnswer = new Answer();
    newAnswer.player = player;
    newAnswer.addedAt = new Date();
    newAnswer.question = currentQuestion;

    if (currentQuestion.correctAnswers.includes(answer)) {
      newAnswer.answerStatus = AnswerStatus.Correct;
      player.answers.push(newAnswer);
      player.score = ++player.score;
    } else {
      newAnswer.answerStatus = AnswerStatus.Incorrect;
      player.answers.push(newAnswer);
    }

    if (
      activeGame.firstPlayer.answers.length === 5 &&
      activeGame.secondPlayer.answers.length === 5
    ) {
      activeGame.status = GameStatus.Finished;
      activeGame.finishGameDate = new Date();
    }

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

      // activeGame.status = GameStatus.Finished;
      // activeGame.finishGameDate = new Date();
      await this.dataSourceRepository.save(fasterPlayer);
    }
    // if (
    //   player.answers.length === 5 &&
    //   activeGame.status === GameStatus.Active &&
    //   player.score !== 0
    // ) {
    //   player.score = +1;
    // }

    await this.dataSourceRepository.save(newAnswer);
    await this.dataSourceRepository.save(player);
    await this.dataSourceRepository.save(activeGame);

    return {
      questionId: newAnswer.question.id,
      answerStatus: newAnswer.answerStatus,
      addedAt: newAnswer.addedAt,
    };
  }
}
