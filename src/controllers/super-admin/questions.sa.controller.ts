import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../dto/question/question.input.dto';
import { CreateQuestionCommand } from '../../domain/questions/use-cases/create-question-use-case';
import { QuestionsQueryDto } from '../../dto/question/questions.query.dto';
import { QuestionsQueryRepository } from '../../infrastructure/repositories/questions/questions-query.repository';
import { UpdateQuestionInputDto } from '../../dto/question/update-question.input.dto';
import { QuestionParamsDto } from '../../dto/question/question.params.dto';
import { UpdateQuestionCommand } from '../../domain/questions/use-cases/update-question-use-case';
import { PublishQuestionCommand } from '../../domain/questions/use-cases/publish-question-use-case';
import { PublishQuestionInputDto } from '../../dto/question/publish-question.input.dto';
import { DeleteQuestionCommand } from '../../domain/questions/use-cases/delete-question-use-case';

@Controller()
export class QuestionsSaController {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get(`${RouterPaths.questions}`)
  async getUser(@Query() params: QuestionsQueryDto) {
    return await this.questionsQueryRepository.getSortedQuestions(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.questions}`)
  async createQuestion(@Body() body: QuestionInputDto) {
    return await this.commandBus.execute(new CreateQuestionCommand(body));
  }

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.questions}/:id`)
  async UpdateQuestion(
    @Body() body: UpdateQuestionInputDto,
    @Param() params: QuestionParamsDto,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(new UpdateQuestionCommand(body, params)),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Put(`${RouterPaths.questions}/:id/publish`)
  async PublishQuestion(
    @Body() body: PublishQuestionInputDto,
    @Param() params: QuestionParamsDto,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(new PublishQuestionCommand(body, params)),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.questions}/:id`)
  async DeleteQuestion(
    @Param() params: QuestionParamsDto,
    @Res() res: Response,
  ) {
    res.sendStatus(
      await this.commandBus.execute(new DeleteQuestionCommand(params)),
    );
  }
}
