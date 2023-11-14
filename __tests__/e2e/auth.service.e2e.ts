import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { RouterPaths } from '../../src/constants/router.paths';
import { User, UserDocument, UserSchema } from '../../src/schemas/user.schema';
import mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from '../../src/infrastructure/repositories/users.repository';
import {
  Device,
  DeviceDocument,
  DeviceSchema,
} from '../../src/schemas/device.schema';
import { emailTemplatesManager } from '../../src/infrastructure/email-templates-manager';

describe('tests for auth service', () => {
  let app: INestApplication;
  let httpServer;
  let userModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: mongoose.model<UserDocument>('users', UserSchema),
        },
        {
          provide: getModelToken(Device.name),
          useValue: mongoose.model<DeviceDocument>('devices', DeviceSchema),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();
    httpServer = app.getHttpServer();

    userModel = moduleFixture.get(getModelToken(User.name));

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create user', () => {
    test('should not create user with incorrect input data', async () => {
      // const result = await authService.createUser(invalidUserData);
      // expect(errorMessageGeneratorMock).toBeCalledTimes(0);
      // expect(result).toBe(false);
    });

    test('should create user with correct input data', async () => {
      emailTemplatesManager.sendEmailConfirmationMessage = jest.fn();

      // const result = await authService.createUser(validUserData);
      //
      // expect(errorMessageGeneratorMock).toBeCalledTimes(0);
      // expect(result).toBe(true);
      // expect(
      //   emailTemplatesManager.sendEmailConfirmationMessage,
      // ).toBeCalledTimes(1);
      // const createdUser = await usersRepository.findUserByLoginOrEmail(
      //   validUserData.login,
      // );
      // expect(createdUser.accountData.email).toBe(validUserData.email);
      // expect(createdUser.accountData.login).toBe(validUserData.login);
    });
  });
});
