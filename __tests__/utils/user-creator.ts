import { usersTestManager } from './users-test-manager';
import request from 'supertest';
import { RouterPaths } from '../../src/constants/router.paths';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { UserInputDto } from '../../src/dto/users/user.input.dto';
const { parse } = require('cookie');

export const userCreator = async (
  httpServer: string,
  userData: UserInputDto,
) => {
  const resp = await usersTestManager.createUser(httpServer, userData);
  const user = resp.createdUser;
  const result = await request(httpServer)
    .post(`${RouterPaths.auth}/login`)
    .send({
      loginOrEmail: userData.login,
      password: userData.password,
    })
    .expect(HTTP_STATUSES.OK_200);

  expect(result.body.accessToken).not.toBeUndefined();
  const cookies = result.headers['set-cookie'];
  const parsedCookies: Array<any> = cookies.map(parse);
  const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken);
  expect(exampleCookie?.refreshToken).not.toBeUndefined();
  const accessToken = result.body.accessToken;
  const refreshToken = exampleCookie?.refreshToken;

  return {
    user,
    accessToken,
    refreshToken,
  };
};
