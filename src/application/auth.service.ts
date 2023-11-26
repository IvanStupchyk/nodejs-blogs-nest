import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtService } from '../infrastructure/jwt.service';
import { Device } from '../entities/devices/device.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async _createDevice(
    req: Request,
    deviceId: string,
    userId: any,
    refreshToken: string,
  ): Promise<any> {
    const newDevice = new Device();
    newDevice.deviceId = deviceId;
    newDevice.title = req.headers['user-agent'] ?? 'unknown';
    newDevice.ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket.remoteAddress ?? '');
    newDevice.user = userId;

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
