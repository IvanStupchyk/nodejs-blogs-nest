import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { QuestionParamsDto } from '../../../application/dto/question/question.params.dto';
import { QuestionsRepository } from '../../../infrastructure/repositories/questions/questions.repository';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';
import { PublishQuestionInputDto } from '../../../application/dto/question/publish-question.input.dto';

export class PublishQuestionCommand {
  constructor(
    public publishStatus: PublishQuestionInputDto,
    public params: QuestionParamsDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(command: PublishQuestionCommand): Promise<number> {
    if (!isUUID(command.params.id)) return HttpStatus.NOT_FOUND;

    const question = await this.questionsRepository.findQuestionById(
      command.params.id,
    );
    if (!question) return HttpStatus.NOT_FOUND;

    question.published = command.publishStatus.published;
    question.updatedAt = new Date();

    await this.dataSourceRepository.save(question);

    return HttpStatus.NO_CONTENT;
  }
}
