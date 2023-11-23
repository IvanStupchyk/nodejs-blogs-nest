import request from 'supertest';
import { usersTestManager } from '../utils/users-test-manager';
import { emailTemplatesManager } from '../../src/infrastructure/email-templates-manager';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { UserInputDto } from '../../src/dto/users/user.input.dto';
import { RouterPaths } from '../../src/constants/router.paths';
import mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { errorsConstants } from '../../src/constants/errors.contants';
const { parse } = require('cookie');

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('tests for /auth', () => {
  const invalidUserData = {
    login: '',
    password: '',
    email: '',
  };

  const validUserData: UserInputDto = {
    login: 'Nick',
    password: '123456',
    email: 'nickNick@gmail.com',
  };

  const secondUserData: UserInputDto = {
    login: 'Ivan',
    password: '123456',
    email: 'ivan@gmail.com',
  };

  // let app: INestApplication;
  // let httpServer;
  // let userModel;
  // let usersRepository;
  // const getRequest = () => {
  //   return request(httpServer);
  // };
  //
  // beforeAll(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule],
  //     providers: [
  //       {
  //         provide: getModelToken(User.name),
  //         useValue: mongoose.model<UserDocument>('users', UserSchema),
  //       },
  //     ],
  //   }).compile();
  //
  //   app = moduleFixture.createNestApplication();
  //
  //   appSettings(app);
  //
  //   await app.init();
  //   httpServer = app.getHttpServer();
  //
  //   userModel = moduleFixture.get(getModelToken(User.name));
  //   // usersRepository = new UsersRepository(userModel);
  //   await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  // });
  //
  // afterAll(async () => {
  //   await app.close();
  // });
  //
  // let simpleUser: UserType;
  // let superAdminUser: UserViewType;
  // it('should not register user with incorrect credentials', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration`)
  //     .send(invalidUserData)
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'login',
  //           message: 'login must be longer than or equal to 3 characters',
  //         },
  //         {
  //           field: 'password',
  //           message: 'password must be longer than or equal to 6 characters',
  //         },
  //         {
  //           field: 'email',
  //           message: 'email must be an email',
  //         },
  //       ],
  //     });
  // });
  //
  // it('should create a super user if the user sends the valid data', async () => {
  //   const { createdUser } = await usersTestManager.createUser(
  //     httpServer,
  //     validUserData,
  //   );
  //
  //   superAdminUser = createdUser;
  //
  //   await getRequest()
  //     .get(RouterPaths.users)
  //     .auth('admin', 'qwerty', { type: 'basic' })
  //     .expect(HTTP_STATUSES.OK_200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [createdUser],
  //     });
  // });
  //
  // it('should not register user with not unique login or email', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration`)
  //     .send(validUserData)
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'email',
  //           message: errorsConstants.email.uniqueEmail,
  //         },
  //         {
  //           field: 'login',
  //           message: errorsConstants.user.uniqueLogin,
  //         },
  //       ],
  //     });
  // });
  //
  // it('should register user with correct credentials', async () => {
  //   emailTemplatesManager.sendEmailConfirmationMessage = jest.fn();
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration`)
  //     .send(secondUserData)
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //   const newUser = await usersRepository.findUserByLoginOrEmail(
  //     secondUserData.email,
  //   );
  //
  //   if (newUser) simpleUser = newUser;
  //
  //   expect(
  //     emailTemplatesManager.sendEmailConfirmationMessage,
  //   ).toHaveBeenCalledTimes(1);
  // }, 30000);
  //
  // it('should not resend confirmation code to email if email is incorrect', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-email-resending`)
  //     .send({
  //       email: [],
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'email',
  //           message: 'email must be an email',
  //         },
  //       ],
  //     });
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-email-resending`)
  //     .send({
  //       email: 'aaa@gmail.com',
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'email',
  //           message: errorsConstants.email.checkEmail,
  //         },
  //       ],
  //     });
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-email-resending`)
  //     .send({
  //       email: superAdminUser.email,
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'email',
  //           message: errorsConstants.email.checkEmail,
  //         },
  //       ],
  //     });
  // });
  //
  // it('should resend confirmation code to email if email is correct', async () => {
  //   emailTemplatesManager.resendEmailConfirmationMessage = jest.fn();
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-email-resending`)
  //     .send({
  //       email: simpleUser.accountData.email,
  //     })
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //   const newUser = await usersRepository.findUserByLoginOrEmail(
  //     simpleUser.accountData.email,
  //   );
  //
  //   if (newUser) simpleUser = newUser;
  //   expect(
  //     emailTemplatesManager.sendEmailConfirmationMessage,
  //   ).toHaveBeenCalledTimes(1);
  // });
  //
  // it('should not confirm email if code is not a string', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-confirmation`)
  //     .send({
  //       code: [],
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'code',
  //           message: errorsConstants.confirmCode.invalidCodeFirst,
  //         },
  //       ],
  //     });
  // });
  //
  // it('should not confirm email if code is incorrect', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-confirmation`)
  //     .send({
  //       code: 'dqwdq',
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'code',
  //           message: errorsConstants.confirmCode.invalidCodeFirst,
  //         },
  //       ],
  //     });
  // });
  //
  // it('should not confirm email if email is already confirmed', async () => {
  //   const adminUser = await usersRepository.findUserByLoginOrEmail(
  //     superAdminUser.email,
  //   );
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-confirmation`)
  //     .send({
  //       code: adminUser?.emailConfirmation.confirmationCode,
  //     })
  //     .expect(HTTP_STATUSES.BAD_REQUEST_400, {
  //       errorsMessages: [
  //         {
  //           field: 'code',
  //           message: errorsConstants.confirmCode.invalidCodeSecond,
  //         },
  //       ],
  //     });
  // });
  //
  // it('should not log in user if email is not confirmed', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send({
  //       loginOrEmail: secondUserData.login,
  //       password: secondUserData.password,
  //     })
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  // });
  //
  // it('should confirm email if code is correct', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/registration-confirmation`)
  //     .send({
  //       code: simpleUser?.emailConfirmation.confirmationCode,
  //     })
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //   const currentUser = await usersRepository.findUserByLoginOrEmail(
  //     simpleUser.accountData.email,
  //   );
  //   expect(currentUser?.emailConfirmation.isConfirmed).toEqual(true);
  // });
  //
  // it('should not return my data if I am not authorized', async () => {
  //   const headers = {
  //     Authorization: `Bearer wefwef`,
  //   };
  //
  //   await getRequest()
  //     .get(`${RouterPaths.auth}/me`)
  //     .set('Cookie', `refreshToken=wef`)
  //     .set(headers)
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  // }, 10000);
  //
  // let firstAccessToken: string;
  // let firstRefreshToken: string;
  // it('should log in user if email is confirmed', async () => {
  //   const result = await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send({
  //       loginOrEmail: secondUserData.login,
  //       password: secondUserData.password,
  //     })
  //     .expect(HTTP_STATUSES.OK_200);
  //
  //   expect(result.body.accessToken).not.toBeUndefined();
  //   const cookies = result.headers['set-cookie'];
  //   const parsedCookies: Array<any> = cookies.map(parse);
  //   const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken);
  //   expect(exampleCookie?.refreshToken).not.toBeUndefined();
  //   firstAccessToken = result.body.accessToken;
  //   firstRefreshToken = exampleCookie?.refreshToken;
  // }, 10000);
  //
  // it('should return my data if everything is fine with tokens', async () => {
  //   const headers = {
  //     Authorization: `Bearer ${firstAccessToken}`,
  //   };
  //
  //   await getRequest()
  //     .get(`${RouterPaths.auth}/me`)
  //     .set('Cookie', `refreshToken=${firstRefreshToken}`)
  //     .set(headers)
  //     .expect(HTTP_STATUSES.OK_200, {
  //       email: simpleUser.accountData.email,
  //       login: simpleUser.accountData.login,
  //       userId: simpleUser.id.toString(),
  //     });
  // }, 10000);
  //
  // it('should not logout the user with incorrect refresh token', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/logout`)
  //     .set('Cookie', `refreshToken=qwe`)
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  // });
  //
  // it('should logout the user with correct refresh token and then do not refresh token with old data', async () => {
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/logout`)
  //     .set('Cookie', `refreshToken=${firstRefreshToken}`)
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/logout`)
  //     .set('Cookie', `refreshToken=${firstRefreshToken}`)
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  //
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/refresh-token`)
  //     .set('Cookie', `refreshToken=${firstRefreshToken}`)
  //     .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  // });
  //
  // let nextAccessToken: string;
  // let nextRefreshToken: string;
  // it('should refresh token with valid input token', async () => {
  //   await sleep(1.5);
  //   const result = await getRequest()
  //     .post(`${RouterPaths.auth}/login`)
  //     .send({
  //       loginOrEmail: secondUserData.login,
  //       password: secondUserData.password,
  //     })
  //     .expect(HTTP_STATUSES.OK_200);
  //
  //   const cookies = result.headers['set-cookie'];
  //   const parsedCookies: Array<any> = cookies.map(parse);
  //   const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken);
  //   const accessToken = result.body.accessToken;
  //   const refreshToken = exampleCookie?.refreshToken;
  //
  //   const meRes = await getRequest()
  //     .get(`${RouterPaths.auth}/me`)
  //     .auth(accessToken, { type: 'bearer' });
  //
  //   expect(meRes.status).toBe(HTTP_STATUSES.OK_200);
  //
  //   await sleep(1.2);
  //
  //   const refreshResponse = await getRequest()
  //     .post(`${RouterPaths.auth}/refresh-token`)
  //     .set('Cookie', `refreshToken=${refreshToken}`)
  //     .send();
  //
  //   expect(refreshResponse.status).toBe(HTTP_STATUSES.OK_200);
  //
  //   nextAccessToken = refreshResponse.body.accessToken;
  //
  //   const cookiesInstance = refreshResponse.headers['set-cookie'];
  //   const parsedSecondCookies: Array<any> = cookiesInstance.map(parse);
  //   const secondCookie = parsedSecondCookies.find(
  //     (cookie) => cookie?.refreshToken,
  //   );
  //   nextRefreshToken = secondCookie?.refreshToken;
  //
  //   expect(nextAccessToken).not.toBe(accessToken);
  //   expect(nextRefreshToken).not.toBe(refreshToken);
  // }, 10000);
  //
  // it('should log out user with correct token', async () => {
  //   await sleep(1.5);
  //   await getRequest()
  //     .post(`${RouterPaths.auth}/logout`)
  //     .set('Cookie', `refreshToken=${nextRefreshToken}`)
  //     .expect(HTTP_STATUSES.NO_CONTENT_204);
  // });
});
