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
import { RefreshTokenMiddleware } from '../../middlewares/refresh-token.middleware';
import { DeleteDeviceParamsDto } from '../../application/dto/devices/delete-device.params.dto';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceCommand } from '../../domain/devices/use-cases/delete-device-use-case';
import { DevicesQueryRepository } from '../../infrastructure/repositories/devices/devices-query.repository';

@Controller(RouterPaths.security)
export class DevicesController {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  async getSessions(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    return res.send(
      await this.devicesQueryRepository.getUserSessions(ids.userId),
    );
  }

  @Delete('devices')
  async deleteAllSessionsExceptCurrent(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    await this.devicesQueryRepository.removeAllSessionsExceptCurrent(
      ids.deviceId,
      ids.userId,
    );

    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Delete('devices/:id')
  async deleteSpecifiedSession(
    @Param() params: DeleteDeviceParamsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const status = await this.commandBus.execute(
      new DeleteDeviceCommand(req, params.id),
    );

    res.sendStatus(status);
  }
}
