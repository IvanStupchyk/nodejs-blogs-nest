import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { mockGetItems } from '../../src/constants/blanks';
import { RouterPaths } from '../../src/constants/router.paths';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { errorsConstants } from '../../src/constants/errors.contants';
import { usersTestManager } from '../utils/users-test-manager';
import { LoginUserInputDto } from '../../src/application/dto/auth/login-user.input.dto';
import { UserViewType } from '../../src/types/users.types';
import { deviceMock, invalidUserData, userData1 } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
import { userCreator } from '../utils/user-creator';

describe('tests for /users and /auth', () => {
  let app: INestApplication;
  let httpServer;
  let accessTokenUser1;
  let refreshTokenUser1;

  beforeAll(async () => {
    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
    await app.close();
  });

  const newUsers: Array<UserViewType> = [];

  it('should return 200 and an empty users array', async () => {
    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  it('should return 404 for not existing user', async () => {
    await request(httpServer)
      .get(RouterPaths.users + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it("shouldn't create a user if the user is not logged in", async () => {
    await usersTestManager.createUser(
      httpServer,
      invalidUserData,
      HTTP_STATUSES.UNAUTHORIZED_401,
      'sssss',
    );
  });

  it("shouldn't create a user if the user sends invalid data", async () => {
    const { response } = await usersTestManager.createUser(
      httpServer,
      invalidUserData,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'login',
          message: 'login must be longer than or equal to 3 characters',
        },
        {
          field: 'password',
          message: 'password must be longer than or equal to 6 characters',
        },
        {
          field: 'email',
          message: 'email must be an email',
        },
      ],
    });

    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, mockGetItems);
  });

  let newUser: UserViewType;
  it('should create a user if the user sends the valid data', async () => {
    const resp = await userCreator(httpServer, userData1);

    newUser = resp.user;
    accessTokenUser1 = resp.accessToken;
    refreshTokenUser1 = resp.refreshToken;

    newUsers.push(newUser);

    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newUser],
      });
  });

  it('should return correctly filtered and sorted blogs', async () => {
    const pageNumber = 2;
    const pageSize = 2;

    const secondUser = await usersTestManager.createUser(httpServer, {
      ...userData1,
      login: 'second',
      email: 'newone@gmail.com',
    });

    const thirdUser = await usersTestManager.createUser(httpServer, {
      ...userData1,
      login: 'third',
      email: 'aaaaaa@gmail.com',
    });

    const fourthUser = await usersTestManager.createUser(httpServer, {
      ...userData1,
      login: 'fourth',
      email: 'heyee@gmail.com',
    });

    newUsers.unshift(secondUser.createdUser);
    newUsers.unshift(thirdUser.createdUser);
    newUsers.unshift(fourthUser.createdUser);

    const sortedUsers = [...newUsers]
      .sort((a, b) => a.login.localeCompare(b.login))
      .slice(
        (pageNumber - 1) * pageSize,
        (pageNumber - 1) * pageSize + pageSize,
      );

    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: newUsers,
      });

    await request(httpServer)
      .get(`${RouterPaths.users}?searchLoginTerm=second`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondUser.createdUser],
      });

    await request(httpServer)
      .get(`${RouterPaths.users}?searchEmailTerm=heyee@gmail.com`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [fourthUser.createdUser],
      });

    await request(httpServer)
      .get(
        `${RouterPaths.users}?sortBy=login&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      )
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newUsers.length,
        items: sortedUsers,
      });
  }, 10000);

  it("shouldn't log in user if data is invalid", async () => {
    const invalidCredentials = {
      loginOrEmail: 3333,
      password: 22,
    };

    const response = await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send(invalidCredentials)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'loginOrEmail',
          message: errorsConstants.login.loginOrEmail,
        },
        {
          field: 'password',
          message: errorsConstants.login.password,
        },
      ],
    });
  });

  it('should return 401 status code if credentials are incorrect', async () => {
    const userWithWrongPassword: LoginUserInputDto = {
      loginOrEmail: newUser.login,
      password: '123',
    };

    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send(userWithWrongPassword)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it('should log in a user with correct credentials', async () => {
    const userWithCorrectData: LoginUserInputDto = {
      loginOrEmail: newUser.login,
      password: userData1.password,
    };

    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200);
  });

  describe('ban user', () => {
    it('should not ban a user if body is incorrect or user does not exist', async () => {
      const body = {
        isBanned: '',
        banDate: false,
        banReason: [1, 2],
      };

      const rest = await request(httpServer)
        .put(`${RouterPaths.users}/asfaf/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);

      expect(rest.body).toEqual({
        errorsMessages: [
          {
            field: 'isBanned',
            message: 'isBanned must be a boolean value',
          },
          {
            field: 'banReason',
            message: 'banReason must be longer than or equal to 20 characters',
          },
        ],
      });

      const correctBody = {
        isBanned: true,
        banDate: new Date(),
        banReason: 'because because because because because because',
      };

      await request(httpServer)
        .put(`${RouterPaths.users}/asfaf/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(correctBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should ban, unban and bun a user', async () => {
      const correctBody = {
        isBanned: true,
        banReason: 'because because because because because because',
      };

      const userDevicesBeforeBan = await request(httpServer)
        .get(`${RouterPaths.security}/devices`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .expect(HTTP_STATUSES.OK_200);

      expect(userDevicesBeforeBan.body.length).toBe(2);

      await request(httpServer)
        .put(`${RouterPaths.users}/${newUser.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(correctBody)
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .get(`${RouterPaths.security}/devices`)
        .set('Cookie', `refreshToken=${refreshTokenUser1}`)
        .expect(HttpStatus.UNAUTHORIZED);

      await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: newUser.login,
          password: userData1.password,
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await request(httpServer)
        .put(`${RouterPaths.users}/${newUser.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: false,
          banReason: 'aa because because because because because because',
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: newUser.login,
          password: userData1.password,
        })
        .expect(HttpStatus.OK);

      await request(httpServer)
        .put(`${RouterPaths.users}/${newUser.id}/ban`)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          isBanned: true,
          banReason: 'again because because because because because',
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .post(`${RouterPaths.auth}/login`)
        .send({
          loginOrEmail: newUser.login,
          password: userData1.password,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  it("shouldn't delete user if the user doesn't exist", async () => {
    await request(httpServer)
      .delete(`${RouterPaths.users}/22`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(userData1)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('should delete a user with exiting id', async () => {
    await request(httpServer)
      .delete(`${RouterPaths.users}/${newUser.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const filteredUsers = newUsers.filter((b) => b.id !== newUser.id);

    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredUsers.length,
        items: filteredUsers,
      });
  });
});
