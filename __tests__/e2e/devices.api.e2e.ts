import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { usersTestManager } from '../utils/users-test-manager';
import { INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../src/constants/router.paths';
import { deviceMock, userData1, userData2 } from '../mockData/mock-data';
import { serverStarter } from '../utils/server-starter';
const { parse } = require('cookie');

const sleep = (seconds: number) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

describe('tests for /devices and /auth', () => {
  let app: INestApplication;
  let httpServer;

  const getRequest = () => {
    return request(httpServer);
  };

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

  let simpleUser;
  it('should create two users for next test cases', async () => {
    const { createdUser } = await usersTestManager.createUser(
      httpServer,
      userData1,
    );

    const secondUser = await usersTestManager.createUser(httpServer, userData2);
    simpleUser = secondUser.createdUser;

    await getRequest()
      .get(RouterPaths.users)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [simpleUser, createdUser],
      });
  });

  let firstRefreshToken: string;
  let fifthRefreshToken: string;
  let firstUserSessions: any;
  let secondUserSessions: any;
  it('should create five sessions', async () => {
    const firstLogin = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const firstCookies = firstLogin.headers['set-cookie'];
    const firstParsedCookies: Array<any> = firstCookies.map(parse);
    const firstExampleCookie = firstParsedCookies.find(
      (cookie) => cookie?.refreshToken,
    );
    firstRefreshToken = firstExampleCookie?.refreshToken;

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const fifthLogin = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const fifthCookies = fifthLogin.headers['set-cookie'];
    const fifthParsedCookies: Array<any> = fifthCookies.map(parse);
    const fifthExampleCookie = fifthParsedCookies.find(
      (cookie) => cookie?.refreshToken,
    );
    fifthRefreshToken = fifthExampleCookie?.refreshToken;

    const secondUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevices.body).toEqual([
      deviceMock,
      deviceMock,
      deviceMock,
    ]);
    expect(secondUserDevices.body.length).toEqual(3);

    secondUserSessions = secondUserDevices.body;
    const firstUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    firstUserSessions = firstUserDevices.body;
    expect(firstUserDevices.body).toEqual([deviceMock, deviceMock]);
    expect(firstUserDevices.body.length).toEqual(2);
  }, 20000);

  it('should refresh token and update this session', async () => {
    await sleep(1);

    await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.OK_200);

    const secondUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevices.body[0]).toEqual(secondUserSessions[0]);
    expect(secondUserDevices.body[1]).toEqual(secondUserSessions[1]);
    expect(secondUserDevices.body[2]).not.toEqual(secondUserSessions[2]);
    expect(secondUserDevices.body[2].deviceId).toBe(
      secondUserSessions[2].deviceId,
    );
    expect(secondUserDevices.body.length).toEqual(3);
  });

  it('should not delete session if device id is incorrect or user tries to delete other user session', async () => {
    await getRequest()
      .delete(`${RouterPaths.security}/devices/wer`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await getRequest()
      .delete(
        `${RouterPaths.security}/devices/${firstUserSessions[0].deviceId}`,
      )
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.FORBIDDEN_403);
  });

  it('should delete own user session if device id is correct', async () => {
    const firstUserDevicesStart = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(firstUserDevicesStart.body.length).toEqual(2);

    await getRequest()
      .delete(
        `${RouterPaths.security}/devices/${firstUserSessions[1].deviceId}`,
      )
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const firstUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(firstUserDevices.body.length).toEqual(1);
  });

  it('should delete all user sessions except current', async () => {
    const secondUserDevicesStart = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevicesStart.body.length).toEqual(3);

    await getRequest()
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const secondUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevices.body.length).toEqual(1);
  });

  it('should delete session if user is logged out', async () => {
    await sleep(10);
    const secondUserDevicesStart = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevicesStart.body.length).toEqual(1);

    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .send()
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    const loginRequest = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const cookies = loginRequest.headers['set-cookie'];
    const parsedCookies: Array<any> = cookies.map(parse);
    const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken);
    const newRefreshToken = exampleCookie?.refreshToken;

    await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${fifthRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    const secondUserDevices = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', `refreshToken=${newRefreshToken}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(secondUserDevices.body.length).toEqual(2);
  }, 20000);

  it('should return 429 if user sent more than 5 request during 10 seconds', async () => {
    await sleep(11);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password,
      })
      .expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
  }, 20000);
});
