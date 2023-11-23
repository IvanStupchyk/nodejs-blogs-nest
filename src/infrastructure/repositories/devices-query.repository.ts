import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewType } from '../../types/devices.types';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getUserSessions(userId: string): Promise<Array<DeviceViewType>> {
    return await this.dataSource.query(
      `
      select "ip", "title", "lastActiveDate", "deviceId"
      from public.devices
      where "userId" = $1
    `,
      [userId],
    );
  }

  async removeAllSessionsExceptCurrent(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
    DELETE from public.devices
    where ("userId" = $1 and "deviceId" != $2)
    `,
      [userId, deviceId],
    );

    return !!isDeleted[1];
  }
}
