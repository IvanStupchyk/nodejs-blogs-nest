import { Request } from 'express';
import { JwtService } from './jwt.service';
import { DevicesRepository } from './repositories/devices.repository';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class RefreshTokenMiddleware {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly devicesRepository: DevicesRepository,
  ) {}

  async checkRefreshToken(
    req: Request,
  ): Promise<{ userId: ObjectId; deviceId: ObjectId } | null> {
    if (!req.cookies?.refreshToken) {
      return null;
    }

    const result: any = await this.jwtService.verifyRefreshToken(
      req.cookies.refreshToken,
    );

    if (result?.userId) {
      const session = await this.devicesRepository.findDeviceById(
        result?.deviceId,
      );
      if (!session) {
        return null;
      }

      return {
        userId: result?.userId,
        deviceId: result?.deviceId,
      };
    } else {
      return null;
    }
  }
}
