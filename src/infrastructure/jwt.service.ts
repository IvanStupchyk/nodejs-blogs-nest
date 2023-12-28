import jwt from "jsonwebtoken";
import { settings } from "../constants/settings";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtService {
  async createAccessJWT(userId: string) {
    return jwt.sign({ userId }, settings.JWT_ACCESS_SECRET, {
      expiresIn: 100000,
    });
  }

  async createRefreshJWT(userId: string, deviceId: string) {
    return jwt.sign({ userId, deviceId }, settings.JWT_REFRESH_SECRET, {
      expiresIn: 200000,
    });
  }

  async createPasswordRecoveryJWT(userId: string) {
    return jwt.sign({ userId }, settings.JWT_PASSWORD_RECOVERY, {
      expiresIn: '2h',
    });
  }

  async verifyPasswordRecoveryCode(token: string) {
    try {
      return jwt.verify(token, settings.JWT_PASSWORD_RECOVERY);
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, settings.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  async getUserIdByAccessToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.JWT_ACCESS_SECRET);
      return result.userId;
    } catch (error) {
      return null;
    }
  }
}
