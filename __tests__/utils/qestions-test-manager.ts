import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { RouterPaths } from '../../src/constants/router.paths';
import { QuestionInputDto } from '../../src/dto/question/question.input.dto';
import { QuestionViewType } from '../../src/types/question.types';

export const questionsTestManager = {
  async createQuestion(
    httpServer: string,
    data: QuestionInputDto | any,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty',
  ) {
    const response = await request(httpServer)
      .post(RouterPaths.questions)
      .auth('admin', password, { type: 'basic' })
      .send(data)
      .expect(expectedStatusCode);

    let createdQuestion: QuestionViewType;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdQuestion = response.body;

      expect(createdQuestion).toEqual({
        id: expect.any(String),
        body: data.body,
        correctAnswers: data.correctAnswers,
        published: false,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    }

    return { response, createdQuestion };
  },
};
