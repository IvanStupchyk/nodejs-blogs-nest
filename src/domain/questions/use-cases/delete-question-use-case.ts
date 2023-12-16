import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/transactions/data-source.repository';
import { QuestionParamsDto } from '../../../application/dto/question/question.params.dto';
import { QuestionsRepository } from '../../../infrastructure/repositories/questions/questions.repository';
import { isUUID } from '../../../utils/utils';
import { HttpStatus } from '@nestjs/common';

export class DeleteQuestionCommand {
  constructor(public params: QuestionParamsDto) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<number> {
    if (!isUUID(command.params.id)) return HttpStatus.NOT_FOUND;

    const isDeleted = await this.questionsRepository.deleteQuestion(
      command.params.id,
    );
    return isDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
  }
}
