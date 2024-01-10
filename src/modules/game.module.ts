import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UsersModule } from './users.module';
import { TransactionsRepository } from '../infrastructure/repositories/transactions/transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/transactions/data-source.repository';
import { GamesQueryRepository } from '../infrastructure/repositories/game/games-query.repository';
import { QuestionsQueryRepository } from '../infrastructure/repositories/questions/questions-query.repository';
import { QuestionsRepository } from '../infrastructure/repositories/questions/questions.repository';
import { Player } from '../entities/game/Player.entity';
import { Game } from '../entities/game/Game.entity';
import { Answer } from '../entities/game/Answer.entity';
import { Question } from '../entities/game/Question.entity';
import { QuestionsSaController } from '../controllers/super-admin/questions.sa.controller';
import { GameController } from '../controllers/public/game.controller';
import { UpdateQuestionUseCase } from '../domain/questions/use-cases/update-question-use-case';
import { CreateQuestionUseCase } from '../domain/questions/use-cases/create-question-use-case';
import { PublishQuestionUseCase } from '../domain/questions/use-cases/publish-question-use-case';
import { DeleteQuestionUseCase } from '../domain/questions/use-cases/delete-question-use-case';
import { ConnectUserToGameUseCase } from '../domain/game/use-cases/connect-user-to-game-use-case';
import { FindSpecifiedGameUseCase } from '../domain/game/use-cases/find-specified-game-use-case';
import { AnswerToQuestionUseCase } from '../domain/game/use-cases/answer-to-question-use-case';
import { FinishGameUseCase } from '../domain/game/use-cases/finish-game-use-case';
import { QuestionsTransactionRepository } from '../infrastructure/repositories/questions/questions-transaction.repository';
import { GamesTransactionRepository } from '../infrastructure/repositories/game/games-transaction.repository';
import { UsersTransactionRepository } from '../infrastructure/repositories/users/users.transaction.repository';

const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
  ConnectUserToGameUseCase,
  FindSpecifiedGameUseCase,
  FinishGameUseCase,
  AnswerToQuestionUseCase,
];

const entities = [Question, Answer, Game, Player];

const repositories = [
  QuestionsRepository,
  QuestionsQueryRepository,
  QuestionsTransactionRepository,
  GamesQueryRepository,
  GamesTransactionRepository,
  UsersTransactionRepository,
  UsersRepository,
  TransactionsRepository,
  DataSourceRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule, UsersModule],
  controllers: [GameController, QuestionsSaController],
  providers: [...useCases, ...repositories],
  exports: [TypeOrmModule],
})
export class GameModule {}
