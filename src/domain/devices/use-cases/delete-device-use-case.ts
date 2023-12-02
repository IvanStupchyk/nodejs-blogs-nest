import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HTTP_STATUSES, isUUID } from '../../../utils/utils';
import { Request } from 'express';
import { JwtService } from '../../../infrastructure/jwt.service';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { DevicesRepository } from '../../../infrastructure/repositories/devices/devices.repository';

export class DeleteDeviceCommand {
  constructor(
    public req: Request,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<number> {
    if (!command.req.cookies.refreshToken) return HttpStatus.UNAUTHORIZED;
    if (!command.deviceId) return HttpStatus.NOT_FOUND;

    const result: any = await this.jwtService.verifyRefreshToken(
      command.req.cookies.refreshToken,
    );
    if (!result?.userId) return HttpStatus.UNAUTHORIZED;

    const user = await this.usersRepository.fetchAllUserDataById(result.userId);
    if (!user) return HttpStatus.UNAUTHORIZED;

    const isUuid = isUUID(command.deviceId);
    if (!isUuid) return HttpStatus.NOT_FOUND;

    const isDeviceIdExist = await this.devicesRepository.findDeviceById(
      command.deviceId,
    );

    if (!isDeviceIdExist) return HttpStatus.NOT_FOUND;
    if (result.deviceId === command.deviceId) return HttpStatus.FORBIDDEN;

    const isDeleted = await this.devicesRepository.removeSpecifiedSession(
      result.userId,
      command.deviceId,
    );

    if (!isDeleted) return HTTP_STATUSES.FORBIDDEN_403;
    return HttpStatus.NO_CONTENT;
  }
}
