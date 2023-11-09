import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RouterPaths } from '../../constants/routerPaths';
import { RefreshTokenMiddleware } from '../../application/refresh-token.service';
import { DevicesRepository } from '../../infrastructure/repositories/devices.repository';
import { DevicesService } from '../../domains/devices/devices.service';
import { DeleteDeviceModel } from './models/DeleteDeviceModel';

@Controller()
export class DevicesController {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
    private readonly devicesService: DevicesService,
  ) {}

  @Get(`${RouterPaths.security}/devices`)
  async getSessions(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    return res.send(await this.devicesRepository.getUserSessions(ids.userId));
  }

  @Delete(`${RouterPaths.security}/devices`)
  async deleteAllSessionsExceptCurrent(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    await this.devicesRepository.removeAllExceptCurrentSessions(
      ids.deviceId,
      ids.userId,
    );

    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Delete(`${RouterPaths.security}/devices/:id`)
  async deleteSpecifiedSession(
    @Param() params: DeleteDeviceModel,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const status = await this.devicesService.deleteSession(req, req.params.id);

    res.sendStatus(status);
  }
}
