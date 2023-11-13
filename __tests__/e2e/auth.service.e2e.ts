import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/app.settings';
import { NewUserDto } from '../../src/dtos/users/new-user.dto';
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
import { AuthService } from '../../src/application/auth.service';
import { DevicesRepository } from '../../src/infrastructure/repositories/devices.repository';
import { JwtService } from '../../src/infrastructure/jwt.service';
import * as errorsGenerators from '../../src/utils/error-message-generator';
import { emailTemplatesManager } from '../../src/infrastructure/email-templates-manager';

describe('tests for auth service', () => {
  const invalidUserData = {
    login: '',
    password: '',
    email: '',
  };

  const validUserData: NewUserDto = {
    login: 'Nick',
    password: '123456',
    email: 'nickNick@gmail.com',
  };

  let app: INestApplication;
  let httpServer;
  let userModel;
  let deviceModel;
  let usersRepository;
  let authService;
  let errorMessageGeneratorMock: jest.SpyInstance;
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
    deviceModel = moduleFixture.get(getModelToken(Device.name));
    usersRepository = new UsersRepository(userModel);
    const devicesRepository = new DevicesRepository(deviceModel);
    const jwtService = new JwtService();
    authService = new AuthService(
      devicesRepository,
      usersRepository,
      userModel,
      jwtService,
    );

    errorMessageGeneratorMock = jest.spyOn(
      errorsGenerators,
      'errorMessageGenerator',
    );

    await request(httpServer).delete(`${RouterPaths.testing}/all-data`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create user', () => {
    test('should not create user with incorrect input data', async () => {
      const result = await authService.createUser(invalidUserData);
      expect(errorMessageGeneratorMock).toBeCalledTimes(0);
      expect(result).toBe(false);
    });

    test('should create user with correct input data', async () => {
      emailTemplatesManager.sendEmailConfirmationMessage = jest.fn();

      const result = await authService.createUser(validUserData);

      expect(errorMessageGeneratorMock).toBeCalledTimes(0);
      expect(result).toBe(true);
      expect(
        emailTemplatesManager.sendEmailConfirmationMessage,
      ).toBeCalledTimes(1);
      const createdUser = await usersRepository.findUserByLoginOrEmail(
        validUserData.login,
      );
      expect(createdUser.accountData.email).toBe(validUserData.email);
      expect(createdUser.accountData.login).toBe(validUserData.login);
    });
  });
});
