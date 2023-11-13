import { Request } from 'express';
import { HTTP_STATUSES } from '../../utils/utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DevicesRepository } from '../../infrastructure/repositories/devices.repository';
import { UserType } from '../../controllers/users/models/user.model';
import { JwtService } from '../../infrastructure/jwt.service';
import { isValidObjectId } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

@Injectable()
export class DevicesService {
  constructor(
    protected readonly refreshTokenDevicesRepository: DevicesRepository,
    protected readonly usersRepository: UsersRepository,
    protected readonly jwtService: JwtService,
  ) {}

  async deleteSession(req: Request, deviceId: string): Promise<number> {
    if (!req.cookies.refreshToken) return HttpStatus.UNAUTHORIZED;
    if (!deviceId) return HttpStatus.NOT_FOUND;

    const result: any = await this.jwtService.verifyRefreshToken(
      req.cookies.refreshToken,
    );
    if (!result?.userId) return HttpStatus.UNAUTHORIZED;

    const user: UserType | null =
      await this.usersRepository.fetchAllUserDataById(result.userId);
    if (!user) return HttpStatus.UNAUTHORIZED;

    if (!isValidObjectId(deviceId)) return HttpStatus.NOT_FOUND;
    const deviceIdObjectId = new ObjectId(deviceId);
    const isDeviceIdExist =
      await this.refreshTokenDevicesRepository.findDeviceById(deviceIdObjectId);
    if (!isDeviceIdExist) return HttpStatus.NOT_FOUND;
    if (result.deviceId === deviceId) return HttpStatus.FORBIDDEN;

    const isDeleted =
      await this.refreshTokenDevicesRepository.removeSpecifiedSession(
        result.userId,
        deviceId,
      );

    if (!isDeleted) return HTTP_STATUSES.FORBIDDEN_403;
    return HttpStatus.NO_CONTENT;
  }
}
