import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../../entities/devices/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}
  async deleteAllSessions(): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .execute();

    return !!result.affected;
  }

  async save(device: Device): Promise<boolean> {
    return !!(await this.devicesRepository.save(device));
  }

  async findDeviceById(deviceId: string): Promise<Device> {
    return (await this.devicesRepository
      .createQueryBuilder('d')
      .where('d.deviceId = :deviceId', {
        deviceId,
      })
      .getOne()) as Device;
  }

  async removeSpecifiedSession(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const isDeleted = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('deviceId = :deviceId', { deviceId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return !!isDeleted.affected;
  }
}
