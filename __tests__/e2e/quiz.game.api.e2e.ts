import request from 'supertest';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { userData1, userData2, validQuestionData } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { QuestionViewType } from '../../src/types/question.types';
import { questionsTestManager } from '../utils/qestions-test-manager';
import { AnswerStatus, GameStatus } from '../../src/types/general.types';
import { UserInputDto } from '../../src/application/dto/users/user.input.dto';
import { GameTestManager } from '../utils/game-manager';
import { answersFinder } from '../utils/answers-finder';
import { userCreator } from '../utils/user-creator';

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('tests for /sa/quiz/questions', () => {
  let app: INestApplication;
  let httpServer;
  let user1;
  let user2;
  let user3;
  let user4;
  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let accessTokenUser3: string;
  let accessTokenUser4: string;

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

  beforeAll(async () => {
    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);

    const resp = await userCreator(httpServer, userData1);
    user1 = resp.user;
    accessTokenUser1 = resp.accessToken;

    const resp2 = await userCreator(httpServer, userData2);
    user2 = resp2.user;
    accessTokenUser2 = resp2.accessToken;

    const resp3 = await userCreator(httpServer, thirdUser);
    user3 = resp3.user;
    accessTokenUser3 = resp3.accessToken;

    const resp4 = await userCreator(httpServer, fourthUser);
    user4 = resp4.user;
    accessTokenUser4 = resp4.accessToken;
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  let gameId: string;
  let game1User1;
  let game2User1;
  let game3User1;
  let adminQuestions;
  describe('questions for future tests', () => {
    it('should create 7 questions and publish them', async () => {
      const newQuestions: Array<QuestionViewType> = [];

      const { createdQuestion } = await questionsTestManager.createQuestion(
        httpServer,
        validQuestionData,
      );

      const newQuestion = createdQuestion;
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

      const newQuestion2 = question2.createdQuestion;
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

      const newQuestion3 = question3.createdQuestion;
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

      const newQuestion4 = question4.createdQuestion;
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

      const newQuestion5 = question5.createdQuestion;
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

      const newQuestion6 = question6.createdQuestion;
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
      adminQuestions = resp;

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
  });

  describe('connection, my-current and pairs/id endpoints', () => {
    it('should not connect user to the game in unauthorized status', async () => {
      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .expect(401);
    });

    it('should connect the first user to the new game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser1}`,
      };

      const result = await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
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
        .post(`${RouterPaths.game}/pairs/my-current/answers`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .send({
          answer: 'efe',
        })
        .expect(403);

      const response = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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
        .get(`${RouterPaths.game}/pairs/${gameId}`)
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
        .get(`${RouterPaths.game}/pairs/${gameId}`)
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
        .post(`${RouterPaths.game}/pairs/connection`)
        .set(headers)
        .expect(403);
    });

    it('should connect the second user to the existing game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const response = await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
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
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(403);

      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set(headers)
        .expect(403);
    });

    it('should return current game for the second user', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const responseUser1 = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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
        .get(`${RouterPaths.game}/pairs/my-current`)
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
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .expect(401);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set(headers)
        .expect(403);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/2323`)
        .set(headers)
        .expect(400);
    });

    it('should return a specified game', async () => {
      const headers = {
        Authorization: `Bearer ${accessTokenUser2}`,
      };

      const response = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
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
        .post(`${RouterPaths.game}/pairs/my-current/answers`)
        .set(headers)
        .send({
          answer: 'new',
        })
        .expect(403);

      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/my-current/answers`)
        .expect(401);
    });

    it('should connect two users (user1 and user2) to the first game if there is no started game', async () => {
      const res = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      const activeGame = res.body;

      const correctAnswer1 = answersFinder(
        adminQuestions,
        activeGame.questions[0].id,
      );
      const correctAnswer2 = answersFinder(
        adminQuestions,
        activeGame.questions[1].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[0].id,
        correctAnswer1[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[0].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[3].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[4].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        'id',
        'ans',
        'stat',
        403,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[3].id,
      );

      const middleResult2 = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await sleep(10);

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        'id',
        'ans',
        'stat',
        403,
      );

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      game1User1 = finalResult.body;
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
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(404);

      await request(httpServer)
        .get(`${RouterPaths.game}/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(404);
    });

    it('should connect two users (user3 and user4) to the second game if there is no started game', async () => {
      const response = await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      const gameId = response.body.id;

      const res = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      const activeGame = res.body;

      const correctAnswer1 = answersFinder(
        adminQuestions,
        activeGame.questions[0].id,
      );
      const correctAnswer3 = answersFinder(
        adminQuestions,
        activeGame.questions[2].id,
      );

      const correctAnswer5 = answersFinder(
        adminQuestions,
        activeGame.questions[4].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser3,
        activeGame.questions[0].id,
        correctAnswer1[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser3,
        activeGame.questions[1].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser4,
        activeGame.questions[0].id,
        correctAnswer1[0],
        AnswerStatus.Correct,
      );

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser4,
        activeGame.questions[1].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser4,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser4,
        activeGame.questions[3].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser4,
        activeGame.questions[4].id,
      );

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser3,
        activeGame.questions[2].id,
        correctAnswer3[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser3,
        activeGame.questions[3].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser3,
        activeGame.questions[4].id,
        correctAnswer5[0],
        AnswerStatus.Correct,
      );

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
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
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[2].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[3].id,
              answerStatus: AnswerStatus.Incorrect,
              addedAt: expect.any(String),
            },
            {
              questionId: activeGame.questions[4].id,
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user3.id,
            login: user3.login,
          },
          score: 3,
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

    it('should connect two users (user1 and user2) to the third game if there is no started game', async () => {
      const response = await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      const gameId = response.body.id;

      const res = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      const activeGame = res.body;

      const correctAnswer1 = answersFinder(
        adminQuestions,
        activeGame.questions[0].id,
      );
      const correctAnswer2 = answersFinder(
        adminQuestions,
        activeGame.questions[1].id,
      );

      const correctAnswer5 = answersFinder(
        adminQuestions,
        activeGame.questions[4].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[0].id,
        correctAnswer1[0],
        AnswerStatus.Correct,
      );

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[0].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[3].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[4].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        'id',
        'ans',
        'stat',
        403,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[3].id,
      );

      const middleResult2 = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[4].id,
        correctAnswer5[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        'id',
        'ans',
        'stat',
        403,
      );

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      game2User1 = finalResult.body;
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
              answerStatus: AnswerStatus.Correct,
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: user1.id,
            login: user1.login,
          },
          score: 3,
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

    it('should connect two users (user1 and user2) to the fourth game and do not finish it', async () => {
      const response = await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .post(`${RouterPaths.game}/pairs/connection`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      const gameId = response.body.id;

      const res = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      const activeGame = res.body;

      const correctAnswer1 = answersFinder(
        adminQuestions,
        activeGame.questions[0].id,
      );
      const correctAnswer2 = answersFinder(
        adminQuestions,
        activeGame.questions[1].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[0].id,
        correctAnswer1[0],
        AnswerStatus.Correct,
      );

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[0].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[1].id,
        correctAnswer2[0],
        AnswerStatus.Correct,
      );

      const middleResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
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

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[2].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[3].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        activeGame.questions[4].id,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser2,
        'id',
        'ans',
        'stat',
        403,
      );

      await GameTestManager.answerToQuestion(
        httpServer,
        accessTokenUser1,
        activeGame.questions[3].id,
      );

      const middleResult2 = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my-current`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      const finalResult = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/${gameId}`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      game3User1 = finalResult.body;
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
    });
  });

  describe('my statistic endpoint', () => {
    test('should return user statistic', async () => {
      const responseUser1 = await request(httpServer)
        .get(`${RouterPaths.game}/users/my-statistic`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(responseUser1.body).toEqual({
        sumScore: 5,
        avgScores: 2.5,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 1,
      });

      const responseUser2 = await request(httpServer)
        .get(`${RouterPaths.game}/users/my-statistic`)
        .set({
          Authorization: `Bearer ${accessTokenUser2}`,
        })
        .expect(200);

      expect(responseUser2.body).toEqual({
        sumScore: 4,
        avgScores: 2,
        gamesCount: 2,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 1,
      });

      const responseUser3 = await request(httpServer)
        .get(`${RouterPaths.game}/users/my-statistic`)
        .set({
          Authorization: `Bearer ${accessTokenUser3}`,
        })
        .expect(200);

      expect(responseUser3.body).toEqual({
        sumScore: 3,
        avgScores: 3,
        gamesCount: 1,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 0,
      });

      const responseUser4 = await request(httpServer)
        .get(`${RouterPaths.game}/users/my-statistic`)
        .set({
          Authorization: `Bearer ${accessTokenUser4}`,
        })
        .expect(200);

      expect(responseUser4.body).toEqual({
        sumScore: 2,
        avgScores: 2,
        gamesCount: 1,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
  });

  describe('top players endpoint', () => {
    test('should return user statistic', async () => {
      const response1 = await request(httpServer)
        .get(`${RouterPaths.game}/users/top`)
        .expect(200);

      expect(response1.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 3,
            avgScores: 3,
            gamesCount: 1,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: user3.id,
              login: user3.login,
            },
          },
          {
            sumScore: 5,
            avgScores: 2.5,
            gamesCount: 2,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 1,
            player: {
              id: user1.id,
              login: user1.login,
            },
          },
          {
            sumScore: 4,
            avgScores: 2,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 1,
            player: {
              id: user2.id,
              login: user2.login,
            },
          },
          {
            sumScore: 2,
            avgScores: 2,
            gamesCount: 1,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 0,
            player: {
              id: user4.id,
              login: user4.login,
            },
          },
        ],
      });

      const response2 = await request(httpServer)
        .get(`${RouterPaths.game}/users/top?sort=sumScore%20asc`)
        .expect(200);

      expect(response2.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 2,
            avgScores: 2,
            gamesCount: 1,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 0,
            player: {
              id: user4.id,
              login: user4.login,
            },
          },
          {
            sumScore: 3,
            avgScores: 3,
            gamesCount: 1,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: user3.id,
              login: user3.login,
            },
          },
          {
            sumScore: 4,
            avgScores: 2,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 1,
            player: {
              id: user2.id,
              login: user2.login,
            },
          },
          {
            sumScore: 5,
            avgScores: 2.5,
            gamesCount: 2,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 1,
            player: {
              id: user1.id,
              login: user1.login,
            },
          },
        ],
      });

      await sleep(0.3);

      const response3 = await request(httpServer)
        .get(
          `${RouterPaths.game}/users/top?sort=lossesCount%20asc&sort=avgScores%20asc&pageSize=3`,
        )
        .expect(200);

      expect(response3.body).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 3,
        totalCount: 4,
        items: [
          {
            sumScore: 5,
            avgScores: 2.5,
            gamesCount: 2,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 1,
            player: {
              id: user1.id,
              login: user1.login,
            },
          },
          {
            sumScore: 3,
            avgScores: 3,
            gamesCount: 1,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: user3.id,
              login: user3.login,
            },
          },
          {
            sumScore: 4,
            avgScores: 2,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 1,
            player: {
              id: user2.id,
              login: user2.login,
            },
          },
        ],
      });

      await sleep(0.3);

      const response4 = await request(httpServer)
        .get(
          `${RouterPaths.game}/users/top?sort=dfsdfsdf%20asc&sort=avgScores%20asc`,
        )
        .expect(200);

      expect(response4.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            sumScore: 3,
            avgScores: 3,
            gamesCount: 1,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 0,
            player: {
              id: user3.id,
              login: user3.login,
            },
          },
          {
            sumScore: 5,
            avgScores: 2.5,
            gamesCount: 2,
            winsCount: 1,
            lossesCount: 0,
            drawsCount: 1,
            player: {
              id: user1.id,
              login: user1.login,
            },
          },
          {
            sumScore: 4,
            avgScores: 2,
            gamesCount: 2,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 1,
            player: {
              id: user2.id,
              login: user2.login,
            },
          },
          {
            sumScore: 2,
            avgScores: 2,
            gamesCount: 1,
            winsCount: 0,
            lossesCount: 1,
            drawsCount: 0,
            player: {
              id: user4.id,
              login: user4.login,
            },
          },
        ],
      });
    });
  });

  describe('my games endpoint', () => {
    test('should return all user games', async () => {
      await sleep(1);
      const responseUser1 = await request(httpServer)
        .get(`${RouterPaths.game}/pairs/my`)
        .set({
          Authorization: `Bearer ${accessTokenUser1}`,
        })
        .expect(200);

      expect(responseUser1.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [game3User1, game2User1, game1User1],
      });
    });
  });
});
