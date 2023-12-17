import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Device } from '../../../entities/devices/Device.entity';

@Injectable()
export class DevicesTransactionsRepository {
  async findDeviceById(
    deviceId: string,
    manager: EntityManager,
  ): Promise<Device> {
    return (await manager
      .createQueryBuilder(Device, 'd')
      .where('d.deviceId = :deviceId', {
        deviceId,
      })
      .getOne()) as Device;
  }

  async removeSpecifiedSession(
    userId: string,
    deviceId: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const isDeleted = await manager
      .createQueryBuilder(Device, 'd')
      .delete()
      .from(Device)
      .where('deviceId = :deviceId', { deviceId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return !!isDeleted.affected;
  }
}
