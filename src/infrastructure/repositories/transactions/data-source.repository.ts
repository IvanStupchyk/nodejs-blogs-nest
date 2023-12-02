import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { EntitiesType } from '../../../types/entities.type';

@Injectable()
export class DataSourceRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async save(entity: EntitiesType): Promise<any> {
    return this.dataSource.manager.save(entity);
  }
}
