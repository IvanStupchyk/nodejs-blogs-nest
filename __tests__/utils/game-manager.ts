import request from 'supertest';
import { HttpStatusType } from '../../src/utils/utils';
import { RouterPaths } from '../../src/constants/router.paths';
import { AnswerStatus } from '../../src/types/general.types';

export const GameTestManager = {
  async answerToQuestion(
    httpServer: string,
    accessToken: string,
    questionId: string | undefined,
    answer: string = 'wrongAnswerToAllQuestions',
    answerStat: string = AnswerStatus.Incorrect,
    expectedStatusCode: HttpStatusType = 200,
  ) {
    const response = await request(httpServer)
      .post(`${RouterPaths.game}/pairs/my-current/answers`)
      .set({
        Authorization: `Bearer ${accessToken}`,
      })
      .send({
        answer,
      })
      .expect(expectedStatusCode);

    if (expectedStatusCode === 200) {
      expect(response.body).toEqual({
        questionId: questionId,
        answerStatus: answerStat,
        addedAt: expect.any(String),
      });
    }

    // const response = await request(httpServer)
    //   .post(RouterPaths.saBlogs)
    //   .auth('admin', password, { type: 'basic' })
    //   .send(data)
    //   .expect(expectedStatusCode);
    //
    // let createdBlog;
    //
    // if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
    //   createdBlog = response.body;
    //
    //   expect(createdBlog).toEqual({
    //     id: expect.any(String),
    //     name: data.name,
    //     description: data.description,
    //     websiteUrl: data.websiteUrl,
    //     createdAt: expect.any(String),
    //     isMembership: false,
    //   });
    // }
    //
    // return { response, createdBlog };
  },
};
