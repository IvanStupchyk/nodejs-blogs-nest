import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { UpdateQuestionInputDto } from '../../../application/dto/question/update-question.input.dto';
import { QuestionParamsDto } from '../../../application/dto/question/question.params.dto';
import { QuestionsRepository } from '../../../infrastructure/repositories/questions/questions.repository';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { Question } from '../../../entities/game/Question.entity';

export class UpdateQuestionCommand {
  constructor(
    public questionData: UpdateQuestionInputDto,
    public params: QuestionParamsDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<number> {
    if (!isUUID(command.params.id)) return HttpStatus.NOT_FOUND;

    const question = await this.questionsRepository.findQuestionById(
      command.params.id,
    );
    if (!question) return HttpStatus.NOT_FOUND;

    Question.update(
      question,
      command.questionData.body,
      command.questionData.correctAnswers,
    );

    await this.dataSourceRepository.save(question);

    return HttpStatus.NO_CONTENT;
  }
}
