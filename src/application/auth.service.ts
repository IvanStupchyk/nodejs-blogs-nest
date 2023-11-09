import bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { DeviceType } from '../domains/devices/dto/device.dto';
import { UsersQueryRepository } from '../infrastructure/repositories/users.query.repository';
import { JwtService } from './jwt.service';
import { ViewUserModel } from '../controllers/users/models/View.user.model';
import { DevicesRepository } from '../infrastructure/repositories/devices.repository';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../schemas/user.schema';
import { emailTemplatesManager } from './emailTemplatesManager';
// import { JwtService } from '@nestjs/jwt';
import { ShowOwnUserDataType } from '../types/usersTypes';
import { errorMessageGenerator } from '../utils/errorMessageGenerator';
import { NewUserDto } from '../controllers/users/models/new-user.dto';

@Injectable()
export class AuthService {
  constructor(
    protected readonly refreshTokenDevicesRepository: DevicesRepository,
    protected readonly usersQueryRepository: UsersQueryRepository,
    protected readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(
    req: Request,
    userId: ObjectId,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = new ObjectId();
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    const newDevice = await this._createRefreshTokenDeviceModel(
      req,
      deviceId,
      userId,
      refreshToken,
    );
    await this.refreshTokenDevicesRepository.setNewDevice(newDevice);
    return { accessToken, refreshToken };
  }

  async getOwnData(id: ObjectId): Promise<ShowOwnUserDataType> {
    const user = await this.usersQueryRepository.findUserById(new ObjectId(id));
    return {
      id: user.id,
      email: user.email,
      login: user.login,
    };
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user =
      await this.usersQueryRepository.findUserByLoginOrEmail(loginOrEmail);

    if (user) {
      const isCredentialsCorrect = await bcrypt.compare(
        password,
        user.accountData.passwordHash,
      );

      if (isCredentialsCorrect) {
        return user;
      }
    }
    return null;
  }

  async logoutUser(req: Request): Promise<boolean> {
    if (!req.cookies?.refreshToken) return false;

    try {
      const result: any = await this.jwtService.verifyRefreshToken(
        req.cookies.refreshToken,
      );
      if (!result?.userId) return false;

      const session = await this.refreshTokenDevicesRepository.findDeviceById(
        result?.deviceId,
      );
      if (!session) return false;

      return await this.refreshTokenDevicesRepository.removeSpecifiedSession(
        result.userId,
        result.deviceId,
      );
    } catch (error) {
      return false;
    }
  }

  async createUser(userData: NewUserDto): Promise<boolean> {
    const { login, email, password } = userData;
    const foundUserByLogin =
      await this.usersQueryRepository.findUserByLoginOrEmail(login);

    const foundUserByEmail =
      await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (foundUserByLogin && foundUserByEmail) {
      errorMessageGenerator([
        { field: 'email', message: 'Email should be unique' },
        { field: 'login', message: 'Login should be unique' },
      ]);
    }

    if (foundUserByLogin) {
      errorMessageGenerator([
        { field: 'login', message: 'Login should be unique' },
      ]);
    }

    if (foundUserByEmail) {
      errorMessageGenerator([
        { field: 'email', message: 'Email should be unique' },
      ]);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const smartUserModel = this.UserModel.createUser(
      login,
      email,
      passwordHash,
      false,
      this.UserModel,
    );

    try {
      await emailTemplatesManager.sendEmailConfirmationMessage(smartUserModel);
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error);
      return false;
    }

    return !!(await this.usersRepository.save(smartUserModel));
  }

  async sendRecoveryPasswordCode(email: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (user) {
      try {
        const recoveryCode = await this.jwtService.createPasswordRecoveryJWT(
          user.id,
        );

        await emailTemplatesManager.sendPasswordRecoveryMessage(
          user,
          recoveryCode,
        );
      } catch (error) {
        console.log('sendPasswordRecoveryMessage error', error);
      }
    }
    return true;
  }

  async updatePassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const result: any =
      await this.jwtService.verifyPasswordRecoveryCode(recoveryCode);
    if (!result) {
      errorMessageGenerator([
        { field: 'recoveryCode', message: 'recoveryCode is incorrect' },
      ]);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const user = await this.usersQueryRepository.fetchAllUserDataById(
      result.userId,
    );
    if (!user) {
      errorMessageGenerator([
        { field: 'recoveryCode', message: 'hm, recoveryCode is incorrect' },
      ]);
    }

    user.changeUserPassword(newPasswordHash);

    return !!(await this.usersRepository.save(user));
  }

  async refreshTokens(
    userId: ObjectId,
    deviceId: ObjectId,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      const lastActiveDate = new Date(result.iat * 1000);
      const expirationDate = new Date(result.exp * 1000);

      await this.refreshTokenDevicesRepository.updateExistingSession(
        deviceId,
        lastActiveDate,
        expirationDate,
      );
    } catch (error) {
      console.log(error);
    }

    return { accessToken, refreshToken };
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByConfirmationCode(code);

    if (!user) {
      errorMessageGenerator([
        { field: 'code', message: 'hm, code is invalid' },
      ]);
    } else {
      if (!user.canBeConfirmed(code) || user.emailConfirmation.isConfirmed) {
        errorMessageGenerator([
          { field: 'code', message: 'something wrong with code' },
        ]);
      }

      user.confirm(code);
      return !!(await this.usersRepository.save(user));
    }
  }

  async resendEmail(email: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);
    if (!user || user.emailConfirmation.isConfirmed) {
      errorMessageGenerator([
        { field: 'email', message: 'check you email again please' },
      ]);
    }

    const newCode = uuidv4();
    const newExpirationDate = add(new Date(), { hours: 1, minutes: 30 });

    user.updateConfirmationCodeAndExpirationTime(newExpirationDate, newCode);
    await this.usersRepository.save(user);

    try {
      await emailTemplatesManager.resendEmailConfirmationMessage(
        user.accountData.email,
        newCode,
      );
    } catch (error) {
      console.log('resendEmailConfirmationMessage error', error);
    }

    return true;
  }

  async checkAndFindUserByAccessToken(
    token: string,
  ): Promise<ViewUserModel | null> {
    const userId: ObjectId | null =
      await this.jwtService.getUserIdByAccessToken(token);
    if (!userId) return null;

    return await this.usersQueryRepository.findUserById(userId);
  }

  async _createRefreshTokenDeviceModel(
    req: Request,
    deviceId: ObjectId,
    userId: ObjectId,
    refreshToken: string,
  ): Promise<DeviceType> {
    const newDevice: DeviceType = new DeviceType(
      new ObjectId(),
      (req.headers['x-forwarded-for'] as string) ||
        (req.socket.remoteAddress ?? ''),
      req.headers['user-agent'] ?? 'unknown',
      new Date(),
      new Date(),
      deviceId,
      userId,
    );

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      newDevice.lastActiveDate = new Date(result.iat * 1000);
      newDevice.expirationDate = new Date(result.exp * 1000);
    } catch (error) {
      console.log(error);
    }

    return newDevice;
  }
}
