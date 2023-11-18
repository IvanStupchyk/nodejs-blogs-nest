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
import { RouterPaths } from '../../constants/router.paths';
import { RefreshTokenMiddleware } from '../../infrastructure/refresh-token.middleware';
import { DevicesRepository } from '../../infrastructure/repositories/devices.repository';
import { DeleteDeviceModel } from './models/delete-device.model';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceCommand } from '../../domains/devices/use-cases/delete-device-use-case';
import { DevicesQuerySqlRepository } from '../../infrastructure/repositories-raw-sql/devices-query-sql.repository';

@Controller()
export class DevicesController {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesQuerySqlRepository: DevicesQuerySqlRepository,
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
    private commandBus: CommandBus,
  ) {}

  @Get(`${RouterPaths.security}/devices`)
  async getSessions(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    return res.send(
      await this.devicesQuerySqlRepository.getUserSessions(ids.userId),
    );
  }

  @Delete(`${RouterPaths.security}/devices`)
  async deleteAllSessionsExceptCurrent(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    await this.devicesQuerySqlRepository.removeAllSessionsExceptCurrent(
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

    const status = await this.commandBus.execute(
      new DeleteDeviceCommand(req, req.params.id),
    );

    res.sendStatus(status);
  }
}
