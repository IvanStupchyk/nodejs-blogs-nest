import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../../entities/devices/Device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async findDeviceById(deviceId: string): Promise<Device> {
    return (await this.devicesRepository
      .createQueryBuilder('d')
      .where('d.deviceId = :deviceId', {
        deviceId,
      })
      .getOne()) as Device;
  }
}
