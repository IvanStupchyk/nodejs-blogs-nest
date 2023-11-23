import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { mockBlogs, mockUsers } from '../../src/constants/blanks';
import { RouterPaths } from '../../src/constants/router.paths';
import { INestApplication } from '@nestjs/common';
import { errorsConstants } from '../../src/constants/errors.contants';
import { usersTestManager } from '../utils/users-test-manager';
import { LoginUserInputDto } from '../../src/dto/auth/login-user.input.dto';
import { UserViewType } from '../../src/types/users.types';
import { invalidUserData, userData1 } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';

describe('tests for /users and /auth', () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const serverConfig = await serverStarter();
    httpServer = serverConfig.httpServer;
    app = serverConfig.app;

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await app.close();
  });

  const newUsers: Array<UserViewType> = [];

  it('should return 200 and an empty users array', async () => {
    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, mockUsers);
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
      .expect(HTTP_STATUSES.OK_200, mockBlogs);
  });

  let newUser: UserViewType;
  it('should create a user if the user sends the valid data', async () => {
    const { createdUser } = await usersTestManager.createUser(
      httpServer,
      userData1,
    );

    newUser = createdUser;
    newUsers.push(createdUser);

    await request(httpServer)
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUser],
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
