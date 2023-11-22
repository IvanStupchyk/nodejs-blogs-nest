import { Injectable } from '@nestjs/common';
import { DeviceType } from '../../models/devices/Device.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async deleteAllSessions() {
    return await this.dataSource.query(`
    DELETE from
    public.devices
    `);
  }

  async setNewDevice(newDevice: DeviceType): Promise<boolean> {
    const {
      id,
      ip,
      title,
      deviceId,
      userId,
      lastActiveDate,
      expirationDate,
      createdAt,
    } = newDevice;

    await this.dataSource.query(
      `
    insert into public.devices(
    "id", "ip", "title", "lastActiveDate", "expirationDate", "deviceId", "userId", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        id,
        ip,
        title,
        lastActiveDate,
        expirationDate,
        deviceId,
        userId,
        createdAt,
      ],
    );

    return true;
  }

  async updateExistingSession(
    deviceId: string,
    lastActiveDate: string,
    expirationDate: string,
  ): Promise<boolean> {
    const isUpdated = await this.dataSource.query(
      `
      update public.devices
      set "lastActiveDate" = $2, "expirationDate" = $3
      where "deviceId" = $1
    `,
      [deviceId, lastActiveDate, expirationDate],
    );

    return !!isUpdated[1];
  }

  async findDeviceById(deviceId: string): Promise<DeviceType> {
    const device = await this.dataSource.query(
      `
      select "id", "ip", "title", "lastActiveDate", "expirationDate", "deviceId", "userId", "createdAt"
      from public.devices
      where "deviceId" = $1
    `,
      [deviceId],
    );

    return device[0];
  }

  async removeSpecifiedSession(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
    DELETE from
    public.devices
    where ("userId" = $1 and "deviceId" = $2)
    `,
      [userId, deviceId],
    );

    return !!isDeleted[1];
  }
}
