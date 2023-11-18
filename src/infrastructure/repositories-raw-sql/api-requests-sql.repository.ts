import { APIRequestsCountType } from '../../types/general.types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ApiRequestsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async addAPIRequest(newRequest: APIRequestsCountType): Promise<boolean> {
    const { id, ip, URL, date, createdAt } = newRequest;

    await this.dataSource.query(
      `
    insert into public.apiRequests("id", "ip", "URL", "date", "createdAt")
    values($1, $2, $3, $4, $5)
    `,
      [id, ip, URL, date, createdAt],
    );

    return true;
  }

  async getCountApiRequestToOneEndpoint(
    URL: string,
    ip: string,
    date: string,
  ): Promise<number> {
    return 0;
  }
}
