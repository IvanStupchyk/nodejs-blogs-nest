import { Request } from 'express';
import { JwtService } from '../infrastructure/jwt.service';
import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';

@Injectable()
export class RefreshTokenMiddleware {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly devicesRepository: DevicesRepository,
  ) {}

  async checkRefreshToken(
    req: Request,
  ): Promise<{ userId: string; deviceId: string } | null> {
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
