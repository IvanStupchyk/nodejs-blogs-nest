import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtService } from '../infrastructure/jwt.service';
import { v4 as uuidv4 } from 'uuid';
import { DeviceModel } from '../models/devices/Device.model';
import { DeviceType } from '../types/devices.types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async _createDevice(
    req: Request,
    deviceId: string,
    userId: string,
    refreshToken: string,
  ): Promise<DeviceType> {
    const newDevice = new DeviceModel(
      uuidv4(),
      (req.headers['x-forwarded-for'] as string) ||
        (req.socket.remoteAddress ?? ''),
      req.headers['user-agent'] ?? 'unknown',
      new Date().toISOString(),
      new Date().toISOString(),
      deviceId,
      userId,
      new Date().toISOString(),
    );

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      newDevice.lastActiveDate = new Date(result.iat * 1000).toISOString();
      newDevice.expirationDate = new Date(result.exp * 1000).toISOString();
    } catch (error) {
      console.log(error);
    }

    return newDevice;
  }
}
