import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { QuestionInputDto } from '../../../application/dto/question/question.input.dto';
import { Question } from '../../../entities/game/Question.entity';
import { QuestionViewType } from '../../../types/question.types';

export class CreateQuestionCommand {
  constructor(public questionData: QuestionInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private readonly dataSourceRepository: DataSourceRepository) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionViewType> {
    const newQuestion = new Question();

    newQuestion.body = command.questionData.body;
    newQuestion.correctAnswers = command.questionData.correctAnswers;

    const savedQuestion = await this.dataSourceRepository.save(newQuestion);

    return {
      id: savedQuestion.id,
      body: savedQuestion.body,
      correctAnswers: savedQuestion.correctAnswers,
      published: savedQuestion.published,
      updatedAt: savedQuestion.updatedAt,
      createdAt: savedQuestion.createdAt,
    };
  }
}
