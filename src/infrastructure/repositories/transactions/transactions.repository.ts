import { EntityManager } from 'typeorm';
import { EntitiesType } from '../../../types/entities.type';

export class TransactionsRepository {
  async save(entity: EntitiesType, manager: EntityManager): Promise<any> {
    return manager.save(entity);
  }
}
