import request from 'supertest';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { userData1, userData2, validQuestionData } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { QuestionViewType } from '../../src/types/question.types';
import { questionsTestManager } from '../utils/qestions-test-manager';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { usersTestManager } from '../utils/users-test-manager';
import { AnswerStatus, GameStatus } from '../../src/types/general.types';
import { UserInputDto } from '../../src/dto/users/user.input.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { GamesRepository } from '../../src/infrastructure/repositories/game/games.repository';
const { parse } = require('cookie');

describe('tests for /sa/quiz/questions', () => {
  let app: INestApplication;
  let httpServer;
  let gamesRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    gamesRepository = moduleFixture.get<GamesRepository>(GamesRepository);

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    // await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  const thirdUser: UserInputDto = {
    login: 'Third',
    password: '123456',
    email: 'third@gmai.com',
  };

  const fourthUser: UserInputDto = {
    login: 'Fourth',
    password: '123456',
    email: 'fourth@gmai.com',
  };
  const newQuestions: Array<QuestionViewType> = [];
  let newQuestion: QuestionViewType;
  let newQuestion2: QuestionViewType;
  let newQuestion3: QuestionViewType;
  let newQuestion4: QuestionViewType;
  let newQuestion5: QuestionViewType;
  let newQuestion6: QuestionViewType;
  let user1;
  let user2;
  let user3;
  let user4;
  let accessTokenUser1: string;
  let refreshTokenUser1: string;
  let accessTokenUser2: string;
  let refreshTokenUser2: string;
  let accessTokenUser3: string;
  let refreshTokenUser3: string;
  let accessTokenUser4: string;
  let refreshTokenUser4: string;
  let gameId: string;
  describe('question and users for future tests', () => {
    it('should create 7 questions and publish them', async () => {
      const { createdQuestion } = await questionsTestManager.createQuestion(
        httpServer,
        validQuestionData,
      );

      newQuestion = createdQuestion;
      newQuestions.push(createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion.published = true;
      newQuestion.updatedAt = new Date();

      const question2 = await questionsTestManager.createQuestion(httpServer, {
        body: 'second question',
        correctAnswers: ['second'],
      });

      newQuestion2 = question2.createdQuestion;
      newQuestions.unshift(question2.createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion2.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion2.published = true;
      newQuestion2.updatedAt = new Date();

      const question3 = await questionsTestManager.createQuestion(httpServer, {
        body: 'third question',
        correctAnswers: ['third'],
      });

      newQuestion3 = question3.createdQuestion;
      newQuestions.unshift(question3.createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion3.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion3.published = true;
      newQuestion3.updatedAt = new Date();

      const question4 = await questionsTestManager.createQuestion(httpServer, {
        body: 'fourth question',
        correctAnswers: ['fourth'],
      });

      newQuestion4 = question4.createdQuestion;
      newQuestions.unshift(question4.createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion4.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion4.published = true;
      newQuestion4.updatedAt = new Date();

      const question5 = await questionsTestManager.createQuestion(httpServer, {
        body: 'fifth question',
        correctAnswers: ['fifth'],
      });

      newQuestion5 = question5.createdQuestion;
      newQuestions.unshift(question5.createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion5.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion5.published = true;
      newQuestion5.updatedAt = new Date();

      const question6 = await questionsTestManager.createQuestion(httpServer, {
        body: 'sixth question',
        correctAnswers: ['sixth'],
      });

      newQuestion6 = question6.createdQuestion;
      newQuestions.unshift(question6.createdQuestion);

      await request(httpServer)
        .put(`${RouterPaths.questions}/${newQuestion6.id}/publish`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          published: true,
        })
        .expect(204);

      newQuestion6.published = true;
      newQuestion6.updatedAt = new Date();

      const question7 = await questionsTestManager.createQuestion(httpServer, {
        body: 'seventh question',
        correctAnswers: ['seventh'],
      });

      newQuestions.unshift(question7.createdQuestion);

      const resp = await request(httpServer)
        .get(RouterPaths.questions)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(200);

      expect(resp.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newQuestions.length,
        items: newQuestions.map((q) => {
          return {
            id: q.id,
            body: q.body,
            correctAnswers: q.correctAnswers,
            published: q.published,
            updatedAt: q.updatedAt ? expect.any(String) : null,
            createdAt: q.createdAt,
          };
        }),
      });
    }, 10000);

    it('should create and log in 4 users and for future tests', async () => {
      const resp1 = await usersTestManager.createUser(httpServer, userData1);
      user1 = resp1.createdUser;
      const result1 = await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: userData1.login,
          password: userData1.password,
        })
        .expect(HTTP_STATUSES.OK_200);

      expect(result1.body.accessToken).not.toBeUndefined();
      const cookies1 = result1.headers['set-cookie'];
      const parsedCookies1: Array<any> = cookies1.map(parse);
      const exampleCookie1 = parsedCookies1.find(
        (cookie) => cookie?.refreshToken,
      );
      expect(exampleCookie1?.refreshToken).not.toBeUndefined();
      accessTokenUser1 = result1.body.accessToken;
      refreshTokenUser1 = exampleCookie1?.refreshToken;

      const resp2 = await usersTestManager.createUser(httpServer, userData2);
      user2 = resp2.createdUser;
      const result2 = await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: userData2.login,
          password: userData2.password,
        })
        .expect(HTTP_STATUSES.OK_200);

      expect(result2.body.accessToken).not.toBeUndefined();
      const cookies2 = result2.headers['set-cookie'];
      const parsedCookies2: Array<any> = cookies2.map(parse);
      const exampleCookie2 = parsedCookies2.find(
        (cookie) => cookie?.refreshToken,
      );
      expect(exampleCookie2?.refreshToken).not.toBeUndefined();
      accessTokenUser2 = result2.body.accessToken;
      refreshTokenUser2 = exampleCookie2?.refreshToken;

      const resp3 = await usersTestManager.createUser(httpServer, thirdUser);
      user3 = resp3.createdUser;
      const result3 = await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: thirdUser.login,
          password: thirdUser.password,
        })
        .expect(HTTP_STATUSES.OK_200);

      expect(result3.body.accessToken).not.toBeUndefined();
      const cookies3 = result3.headers['set-cookie'];
      const parsedCookies3: Array<any> = cookies3.map(parse);
      const exampleCookie3 = parsedCookies3.find(
        (cookie) => cookie?.refreshToken,
      );
      expect(exampleCookie3?.refreshToken).not.toBeUndefined();
      accessTokenUser3 = result3.body.accessToken;
      refreshTokenUser3 = exampleCookie3?.refreshToken;

      await request(httpServer)
        .get(`${RouterPaths.users}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_STATUSES.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 3,
          items: [resp3.createdUser, resp2.createdUser, resp1.createdUser],
        });

      const resp4 = await usersTestManager.createUser(httpServer, fourthUser);
      user4 = resp4.createdUser;
      const result4 = await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: fourthUser.login,
          password: fourthUser.password,
        })
        .expect(HTTP_STATUSES.OK_200);

      expect(result4.body.accessToken).not.toBeUndefined();
      const cookies4 = result4.headers['set-cookie'];
      const parsedCookies4: Array<any> = cookies4.map(parse);
      const exampleCookie4 = parsedCookies4.find(
        (cookie) => cookie?.refreshToken,
      );
      expect(exampleCookie4?.refreshToken).not.toBeUndefined();
      accessTokenUser4 = result4.body.accessToken;
      refreshTokenUser4 = exampleCookie4.refreshToken;

      await request(httpServer)
        .get(`${RouterPaths.users}`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .expect(HTTP_STATUSES.OK_200, {
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 4,
          items: [
            resp4.createdUser,
            resp3.createdUser,
            resp2.createdUser,
            resp1.createdUser,
          ],
        });
    });
  });

  describe('connection, my-current and pairs/id endpoints', () => {
    it('should not connect user to the game in unauthorized status', async () => {
      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .expect(401);
    });

    it('should connect the first user to the new game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser1}`,
      };

      const result = await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set(headers)
        .expect(200);

      expect(result.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatus.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'efe',
        })
        .expect(403);

      const response = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set(headers)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatus.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      gameId = response.body.id;

      const currentGame = await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set(headers)
        .expect(200);

      expect(currentGame.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatus.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(403);
    });

    it('should not connect user to the new game if the user is already participating in an active pair', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser1}`,
      };

      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set(headers)
        .expect(403);
    });

    it('should connect the second user to the existing game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const response = await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set(headers)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 0,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(403);

      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set(headers)
        .expect(403);
    });

    it('should return current game for the second user', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const responseUser1 = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(responseUser1.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 0,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const responseUser2 = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set(headers)
        .expect(200);

      expect(responseUser2.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 0,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('should not return a game if user tries to get a game that is not theirs, not authorized or game does not exist', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser3}`,
      };

      await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .expect(401);

      await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set(headers)
        .expect(403);

      await request(httpServer)
        .get(`${RouterPaths.game}/2323`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set(headers)
        .expect(400);
    });

    it('should return a specified game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const response = await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set(headers)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 0,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });
  });

  describe('answers endpoint', () => {
    it('should not answer to question if user is not inside active pair or unauthorized', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser3}`,
      };

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set(headers)
        .send({
          answer: 'new',
        })
        .expect(403);

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .expect(401);
    });

    it('should answer to question', async () => {
      const activeGame = await gamesRepository.findGameInActiveStatusByUserId(
        user1.id,
      );

      const correctAnswer1 = activeGame.questions[0].correctAnswers;
      const correctAnswer2 = activeGame.questions[1].correctAnswers;

      const responseUser1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: correctAnswer1[0],
        })
        .expect(200);

      expect(responseUser1.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response2User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: correctAnswer2[0],
        })
        .expect(200);

      expect(response2User1.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response3User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'sdsf',
        })
        .expect(200);

      expect(response3User1.body).toEqual({
        questionId: activeGame.questions[2].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response1User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'sdsf',
        })
        .expect(200);

      expect(response1User2.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response2User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: correctAnswer2[0],
        })
        .expect(200);

      expect(response2User2.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(middleResult.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 1,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const response3User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response3User2.body).toEqual({
        questionId: activeGame.questions[2].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response4User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'prel',
        })
        .expect(200);

      expect(response4User2.body).toEqual({
        questionId: activeGame.questions[3].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response5User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'last',
        })
        .expect(200);

      expect(response5User2.body).toEqual({
        questionId: activeGame.questions[4].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'last',
        })
        .expect(403);

      const response4User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp4u1',
        })
        .expect(200);

      expect(response4User1.body).toEqual({
        questionId: activeGame.questions[3].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const middleResult2 = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(middleResult2.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 1,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const response5User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp5u1',
        })
        .expect(200);

      expect(response5User1.body).toEqual({
        questionId: activeGame.questions[4].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp6u1',
        })
        .expect(403);

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(finalResult.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 2,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });

    it('should not return a game with finished status', async () => {
      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(404);

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(404);
    });

    it('should connect two users to the second game if there is no started game', async () => {
      const response = await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      const gameId = response.body.id;

      const activeGame = await gamesRepository.findGameInActiveStatusByUserId(
        user3.id,
      );

      const correctAnswer1 = activeGame.questions[0].correctAnswers;

      const responseUser3 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .send({
          answer: correctAnswer1[0],
        })
        .expect(200);

      expect(responseUser3.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response2User3 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response2User3.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const responseUser4 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .send({
          answer: correctAnswer1[0],
        })
        .expect(200);

      expect(responseUser4.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      const response2User4 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response2User4.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response3User4 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response3User4.body).toEqual({
        questionId: activeGame.questions[2].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response4User4 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response4User4.body).toEqual({
        questionId: activeGame.questions[3].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response5User4 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser4}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response5User4.body).toEqual({
        questionId: activeGame.questions[4].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser3}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      expect(middleResult.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user3.id,
            login: user3.login,
          },
          score: 1,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user4.id,
            login: user4.login,
          },
          score: 1,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });
    });

    it('should connect two users to the third game if there is no started game', async () => {
      const response = await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .post(`${RouterPaths.game}/connection`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      const gameId = response.body.id;

      const activeGame = await gamesRepository.findGameInActiveStatusByUserId(
        user1.id,
      );

      const correctAnswer1 = activeGame.questions[0].correctAnswers;
      const correctAnswer2 = activeGame.questions[1].correctAnswers;

      const responseUser1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: correctAnswer1[0],
        })
        .expect(200);

      expect(responseUser1.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      const response2User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: correctAnswer2[0],
        })
        .expect(200);

      expect(response2User1.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const response3User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'sdsf',
        })
        .expect(200);

      expect(response3User1.body).toEqual({
        questionId: activeGame.questions[2].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response1User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'sdsf',
        })
        .expect(200);

      expect(response1User2.body).toEqual({
        questionId: activeGame.questions[0].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response2User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: correctAnswer2[0],
        })
        .expect(200);

      expect(response2User2.body).toEqual({
        questionId: activeGame.questions[1].id,
        answerStatus: AnswerStatus.Correct,
        addedAt: expect.any(String),
      });

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(middleResult.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 1,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const response3User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'sdf',
        })
        .expect(200);

      expect(response3User2.body).toEqual({
        questionId: activeGame.questions[2].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response4User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'prel',
        })
        .expect(200);

      expect(response4User2.body).toEqual({
        questionId: activeGame.questions[3].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const response5User2 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'last',
        })
        .expect(200);

      expect(response5User2.body).toEqual({
        questionId: activeGame.questions[4].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser2}`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .send({
          answer: 'last',
        })
        .expect(403);

      const response4User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp4u1',
        })
        .expect(200);

      expect(response4User1.body).toEqual({
        questionId: activeGame.questions[3].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      const middleResult2 = await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(middleResult2.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 1,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      const response5User1 = await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp5u1',
        })
        .expect(200);

      expect(response5User1.body).toEqual({
        questionId: activeGame.questions[4].id,
        answerStatus: AnswerStatus.Incorrect,
        addedAt: expect.any(String),
      });

      await request(httpServer)
        .post(`${RouterPaths.game}/my-current/answers`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'resp6u1',
        })
        .expect(403);

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/${gameId}`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(finalResult.body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 2,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: activeGame.questions[0].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[1].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user2.id,
            login: user2.login,
          },
          score: 2,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: GameStatus.Finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });
  });
});
