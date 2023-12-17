import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../../../entities/users/User.entity';

@Injectable()
export class UsersTransactionRepository {
  async fetchAllUserDataById(
    id: string,
    manager: EntityManager,
  ): Promise<User | null> {
    return await manager
      .createQueryBuilder(User, 'u')
      .where('u.id = :id', {
        id,
      })
      .getOne();
  }
}
