import { QuestionInputDto } from "../../application/dto/question/question.input.dto";
import { ErrorsNotification } from "./Errors.notification";

export class ValidateDtoFields {
  questionDtoValidation(dto: QuestionInputDto): ErrorsNotification {
    const note = new ErrorsNotification();

    if (typeof dto.body !== 'string') {
      note.addError('body should be string', 'body', 400);
    }

    if (dto.body.length < 10 || dto.body.length > 500) {
      note.addError(
        'body must be longer than or equal to 10 characters',
        'body',
        400,
      );
    }

    if (!Array.isArray(dto.correctAnswers)) {
      note.addError('correctAnswers should be array', 'correctAnswers', 400);
    }

    if (dto.correctAnswers.length === 0) {
      note.addError(
        'correctAnswers should not be empty',
        'correctAnswers',
        400,
      );
    }

    return note;
  }
}
