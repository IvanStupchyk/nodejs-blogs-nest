import request from 'supertest';
import { HTTP_STATUSES } from '../../src/utils/utils';
import { usersTestManager } from '../utils/users-test-manager';
import { emailTemplatesManager } from '../../src/infrastructure/email-templates-manager';
import { INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../src/constants/router.paths';
import { errorsConstants } from '../../src/constants/errors.contants';
import { UserType, UserViewType } from '../../src/types/users.types';
import { userData1 } from '../mockData/mock-data';
import { JwtService } from '../../src/infrastructure/jwt.service';
import { serverStarter } from '../utils/server-starter';

describe('tests for /auth password recovery', () => {
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
    await app.close();
  });

  let superAdminUser: UserViewType;

  it('should create user for future tests', async () => {
    const { createdUser } = await usersTestManager.createUser(
      httpServer,
      userData1,
    );

    superAdminUser = createdUser;

    await getRequest()
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

  it('should not send password recovery code if email is invalid or does not exist in the system', async () => {
    emailTemplatesManager.sendPasswordRecoveryMessage = jest.fn();

    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: 'fefef',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'email',
            message: 'email must be an email',
          },
        ],
      });

    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: 'heyhey@gmail.com',
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    expect(
      emailTemplatesManager.sendPasswordRecoveryMessage,
    ).not.toHaveBeenCalled();
  });

  it('should send password recovery code if email is valid', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: userData1.email,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    expect(
      emailTemplatesManager.sendPasswordRecoveryMessage,
    ).toHaveBeenCalledTimes(1);
  });

  it('should generate an error if input data is incorrect for new password breakpoint', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/new-password`)
      .send({
        newPassword: '1234',
        recoveryCode: '111',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'newPassword',
            message: 'newPassword must be longer than or equal to 6 characters',
          },
        ],
      });

    await getRequest()
      .post(`${RouterPaths.auth}/new-password`)
      .send({
        newPassword: '12345678',
        recoveryCode: '111',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'recoveryCode',
            message: errorsConstants.recoveryCode.recoveryCodeFirst,
          },
        ],
      });
  });

  it('should change user password and log in with new credentials', async () => {
    emailTemplatesManager.sendPasswordRecoveryMessage = jest.fn();

    const userMock: UserType = {
      id: superAdminUser.id,
      login: superAdminUser.login,
      passwordHash: '',
      createdAt: superAdminUser.createdAt,
      email: superAdminUser.email,
      confirmationCode: 'string',
      expirationDate: new Date(),
      isConfirmed: true,
    };
    const jwtService = new JwtService();
    const recoveryCode = await jwtService.createPasswordRecoveryJWT(
      superAdminUser.id,
    );
    const newPassword = '777777';

    await emailTemplatesManager.sendPasswordRecoveryMessage(
      userMock,
      recoveryCode,
    );

    await getRequest()
      .post(`${RouterPaths.auth}/new-password`)
      .send({
        newPassword,
        recoveryCode,
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password,
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: newPassword,
      })
      .expect(HTTP_STATUSES.OK_200);
  });
});
