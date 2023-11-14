import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { DeviceType } from '../domains/devices/dto/device.dto';
import { JwtService } from '../infrastructure/jwt.service';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
      refreshToken,
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
