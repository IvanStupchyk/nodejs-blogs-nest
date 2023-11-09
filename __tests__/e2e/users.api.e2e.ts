import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { mockUsers } from '../../src/constants/blanks';
import { ViewUserModel } from '../../src/controllers/users/models/View.user.model';
import { NewUserDto } from '../../src/controllers/users/models/new-user.dto';
import { AppModule } from '../../src/app.module';
import { RouterPaths } from '../../src/constants/routerPaths';
import { Test, TestingModule } from '@nestjs/testing';
import { appSettings } from '../../src/app.settings';
import { INestApplication } from '@nestjs/common';

describe('tests for /users and /auth', () => {
  const invalidData: NewUserDto = {
    login: '',
    password: '',
    email: '',
  };

  const validData: NewUserDto = {
    login: 'Nick',
    password: '123456',
    email: 'nickNick@gmail.com',
  };
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();
    httpServer = app.getHttpServer();

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await app.close();
  });

  const newUsers: Array<ViewUserModel> = [];

  it('should return 200 and an empty users array', async () => {
    await request(httpServer)
      .get(RouterPaths.users)
      .expect(HTTP_STATUSES.OK_200, mockUsers);
  });

  it('should return 404 for not existing user', async () => {
    await request(httpServer)
      .get(RouterPaths.users + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  // it("shouldn't create a user if the user is not logged in", async () => {
  //   await usersTestManager.createUser(
  //     httpServer,
  //     invalidData,
  //     HTTP_STATUSES.UNAUTHORIZED_401,
  //     'sssss',
  //   );
  // });
  //
  // it("shouldn't create a user if the user sends invalid data", async () => {
  //   const { response } = await usersTestManager.createUser(
  //     invalidData,
  //     HTTP_STATUSES.BAD_REQUEST_400,
  //   );
  //
  //   expect(response.body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: 'login',
  //         message: errorsConstants.user.login,
  //       },
  //       {
  //         field: 'password',
  //         message: errorsConstants.user.password,
  //       },
  //       {
  //         field: 'email',
  //         message: errorsConstants.user.email,
  //       },
  //     ],
  //   });
  //
  //   await getRequest()
  //     .get(RouterPaths.users)
  //     .expect(HTTP_STATUSES.OK_200, mockBlogs);
  // });
  //
  // let newUser: ViewUserModel;
  // it('should create a user if the user sends the valid data', async () => {
  //   const { createdUser } = await usersTestManager.createUser(validData);
  //
  //   newUser = createdUser;
  //   newUsers.push(createdUser);
  //
  //   await getRequest()
  //     .get(RouterPaths.users)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [createdUser],
  //     });
  // });
  //
  // it('should return correctly filtered and sorted blogs', async () => {
  //   const pageNumber = 2;
  //   const pageSize = 2;
  //
  //   const secondUser = await usersTestManager.createUser({
  //     ...validData,
  //     login: 'second',
  //     email: 'newone@gmail.com',
  //   });
  //
  //   const thirdUser = await usersTestManager.createUser({
  //     ...validData,
  //     login: 'third',
  //     email: 'aaaaaa@gmail.com',
  //   });
  //
  //   const fourthUser = await usersTestManager.createUser({
  //     ...validData,
  //     login: 'fourth',
  //     email: 'heyee@gmail.com',
  //   });
  //
  //   newUsers.unshift(secondUser.createdUser);
  //   newUsers.unshift(thirdUser.createdUser);
  //   newUsers.unshift(fourthUser.createdUser);
  //
  //   const sortedUsers = [...newUsers]
  //     .sort((a, b) => a.login.localeCompare(b.login))
  //     .slice(
  //       (pageNumber - 1) * pageSize,
  //       (pageNumber - 1) * pageSize + pageSize,
  //     );
  //
  //   await getRequest().get(RouterPaths.users).expect(HTTP_STATUSES.OK_200, {
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 4,
  //     items: newUsers,
  //   });
  //
  //   await getRequest()
  //     .get(`${RouterPaths.users}?searchLoginTerm=second`)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [secondUser.createdUser],
  //     });
  //
  //   await getRequest()
  //     .get(`${RouterPaths.users}?searchEmailTerm=heyee@gmail.com`)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [fourthUser.createdUser],
  //     });
  //
  //   await getRequest()
  //     .get(
  //       `${RouterPaths.users}?sortBy=login&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`,
  //     )
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 2,
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: newUsers.length,
  //       items: sortedUsers,
  //     });
  // }, 10000);
  //
  // it("shouldn't log in user if data is invalid", async () => {
  //   //LoginUserDto
  //   const invalidCredentials = {
  //     loginOrEmail: [],
  //     password: 22,
  //   };
  //
  //   const response = await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send(invalidCredentials)
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400);
  //
  //   expect(response.body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: 'loginOrEmail',
  //         message: errorsConstants.login.loginOrEmail,
  //       },
  //       {
  //         field: 'password',
  //         message: errorsConstants.login.password,
  //       },
  //     ],
  //   });
  // });
  //
  // it('should return 401 status code if credentials are incorrect', async () => {
  //   const userWithWrongPassword: LoginUserDto = {
  //     loginOrEmail: newUser.login,
  //     password: '123',
  //   };
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send(userWithWrongPassword)
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  // });
  //
  // it('should log in a user with correct credentials', async () => {
  //   const userWithCorrectData: LoginUserDto = {
  //     loginOrEmail: newUser.login,
  //     password: validData.password,
  //   };
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send(userWithCorrectData)
  //     .expect(HTTP_STATUSES.OK_200);
  // });
  //
  // it("shouldn't delete user if the user doesn't exist", async () => {
  //   await getRequest()
  //     .delete(`${RouterPaths.users}/22`)
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .send(validData)
  //     .expect(HTTP_STATUSES.NOT_FOUND_404);
  // });
  //
  // it('should delete a user with exiting id', async () => {
  //   await getRequest()
  //     .delete(`${RouterPaths.users}/${newUser.id}`)
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //   const filteredUsers = newUsers.filter((b) => b.id !== newUser.id);
  //
  //   await getRequest().get(RouterPaths.users).expect(HTTP_STATUSES.OK_200, {
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: filteredUsers.length,
  //     items: filteredUsers,
  //   });
  // });
});
