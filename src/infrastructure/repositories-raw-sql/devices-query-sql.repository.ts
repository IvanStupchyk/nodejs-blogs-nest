import { Injectable } from '@nestjs/common';
import { DeviceViewType } from '../../types/general.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQuerySqlRepository {
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

    return isDeleted[1] === 1;
  }
}
