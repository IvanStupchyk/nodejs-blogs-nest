import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeviceViewType } from '../../types/devices.types';
import { Device } from '../../entities/devices/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async getUserSessions(userId: string): Promise<Array<DeviceViewType>> {
    const devices = (await this.devicesRepository
      .createQueryBuilder('d')
      .where('d.userId = :userId', { userId })
      .getMany()) as Array<Device>;

    return devices.length
      ? devices.map((d) => {
          return {
            ip: d.ip,
            deviceId: d.deviceId,
            title: d.title,
            lastActiveDate: d.lastActiveDate,
          };
        })
      : [];
  }

  async removeAllSessionsExceptCurrent(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const isDeleted = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId })
      .execute();

    return !!isDeleted.affected;
  }
}
