import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { mockGetItems } from '../../src/constants/blanks';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { validQuestionData } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { QuestionViewType } from '../../src/types/question.types';
import { questionsTestManager } from '../utils/qestions-test-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QuestionsRepository } from '../../src/infrastructure/repositories/questions/questions.repository';

describe('tests for /sa/quiz/questions', () => {
  let app: INestApplication;
  let httpServer;
  let questionsRepository;

  const getRequest = () => {
    return request(httpServer);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    questionsRepository =
      moduleFixture.get<QuestionsRepository>(QuestionsRepository);

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  it('should not create a question if the user sends the invalid data or unauthorized', async () => {
    const { response } = await questionsTestManager.createQuestion(
      httpServer,
      {
        body: 'hey',
        correctAnswers: 'yes',
      },
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'body',
          message: 'body must be longer than or equal to 10 characters',
        },
        {
          field: 'correctAnswers',
          message: 'correctAnswers should not be empty',
        },
      ],
    });

    await questionsTestManager.createQuestion(
      httpServer,
      validQuestionData,
      HTTP_STATUSES.UNAUTHORIZED_401,
      'frgrg',
    );

    await getRequest()
      .get(RouterPaths.questions)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  const newQuestions: Array<QuestionViewType> = [];
  let newQuestion: QuestionViewType;
  let newQuestion2: QuestionViewType;
  let newQuestion3: QuestionViewType;
  let newQuestion4: QuestionViewType;
  it('should create a question if the user sends the valid data', async () => {
    const { createdQuestion } = await questionsTestManager.createQuestion(
      httpServer,
      validQuestionData,
    );

    newQuestion = createdQuestion;
    newQuestions.push(createdQuestion);

    await request(httpServer)
      .get(RouterPaths.questions)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdQuestion],
      });
  });

  describe('update question', () => {
    it('should not update a question if the user sends the invalid data or question does not exist', async () => {
      await request(httpServer)
        .put(`${RouterPaths.questions}/1233`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: 'what is the main goal in the live?',
          correctAnswers: ['joy', 'piece'],
        })
        .expect(HTTP_STATUSES.NOT_FOUND_404);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: '',
          correctAnswers: [],
        })
        .expect(HTTP_STATUSES.BAD_REQUEST_400, {
          errorsMessages: [
            {
              field: 'body',
              message: 'body must be longer than or equal to 10 characters',
            },
            {
              field: 'correctAnswers',
              message: 'correctAnswers should not be empty',
            },
          ],
        });

      await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_STATUSES.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [newQuestion],
        });
    });

    it('should update a question if the user sends the valid data', async () => {
      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: 'answer please what is the main goal in the live?',
          correctAnswers: ['joy', 'piece'],
        })
        .expect(204);

      const updatedQuestion = await questionsRepository.findQuestionById(
        newQuestion.id,
      );

      newQuestion.updatedAt = updatedQuestion.updatedAt;
      newQuestion.body = updatedQuestion.body;
      newQuestion.correctAnswers = updatedQuestion.correctAnswers;

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: false,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });
    });
  });

  describe('publish question', () => {
    it('should not publish a question if the user sends the invalid data or question does not exist', async () => {
      await request(httpServer)
        .put(`${RouterPaths.questions}/1233/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(HTTP_STATUSES.NOT_FOUND_404);

      await request(httpServer)
        .put(`${RouterPaths.questions}/1233/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: 'fff',
        })
        .expect(HTTP_STATUSES.BAD_REQUEST_400, {
          errorsMessages: [
            {
              field: 'published',
              message: 'published must be a boolean value',
            },
          ],
        });

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: false,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });
    });

    it('should publish a question if the user sends the valid data', async () => {
      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion.published = true;

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: newQuestion.published,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });
    });
  });

  describe('question sorting', () => {
    it('should create questions for future sorting', async () => {
      const question2 = await questionsTestManager.createQuestion(httpServer, {
        body: 'second question',
        correctAnswers: ['second'],
      });

      newQuestion2 = question2.createdQuestion;
      newQuestions.unshift(question2.createdQuestion);

      const question3 = await questionsTestManager.createQuestion(httpServer, {
        body: 'third question',
        correctAnswers: ['third'],
      });

      newQuestion3 = question3.createdQuestion;
      newQuestions.unshift(question3.createdQuestion);

      const question4 = await questionsTestManager.createQuestion(httpServer, {
        body: 'fourth question',
        correctAnswers: ['fourth'],
      });

      newQuestion4 = question4.createdQuestion;
      newQuestions.unshift(question4.createdQuestion);

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newQuestions.length,
        items: [
          newQuestion4,
          newQuestion3,
          newQuestion2,
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: newQuestion.published,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });
    });

    it('should return correctly filtered and sorted questions', async () => {
      const pageNumber = 2;
      const pageSize = 2;

      const sortedQuestions = [...newQuestions]
        .sort((a, b) => a.body.localeCompare(b.body))
        .slice(
          (pageNumber - 1) * pageSize,
          (pageNumber - 1) * pageSize + pageSize,
        );

      const resp = await request(httpServer)
        .get(
          `${RouterPaths.questions}?sortBy=body&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
        )
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newQuestions.length,
        items: sortedQuestions,
      });

      const resp2 = await request(httpServer)
        .get(`${RouterPaths.questions}?bodySearchTerm=hird%20questio`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp2.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newQuestion3],
      });
    });

    it('should return correctly filtered and sorted questions by publish status', async () => {
      const resp = await request(httpServer)
        .get(`${RouterPaths.questions}?publishedStatus=all`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newQuestions.length,
        items: [
          newQuestion4,
          newQuestion3,
          newQuestion2,
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: newQuestion.published,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });

      const resp2 = await request(httpServer)
        .get(`${RouterPaths.questions}?publishedStatus=published`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp2.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: newQuestion.published,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });

      const resp3 = await request(httpServer)
        .get(`${RouterPaths.questions}?publishedStatus=notPublished`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp3.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [newQuestion4, newQuestion3, newQuestion2],
      });
    });
  });

  describe('delete question', () => {
    it('should not delete a question if question does not exist', async () => {
      await request(httpServer)
        .delete(`${RouterPaths.questions}/1233`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_STATUSES.NOT_FOUND_404);

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newQuestions.length,
        items: [
          newQuestion4,
          newQuestion3,
          newQuestion2,
          {
            id: newQuestion.id,
            body: newQuestion.body,
            correctAnswers: newQuestion.correctAnswers,
            published: newQuestion.published,
            updatedAt: expect.any(String),
            createdAt: newQuestion.createdAt,
          },
        ],
      });
    });

    it('should delete a question', async () => {
      await request(httpServer)
        .delete(`${RouterPaths.questions}/${newQuestion.id}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(204);

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [newQuestion4, newQuestion3, newQuestion2],
      });
    });
  });
});
