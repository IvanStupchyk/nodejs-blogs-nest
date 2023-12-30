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
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .leftJoinAndSelect('u.userBanByBlogger', 'ubbl')
      .leftJoinAndSelect('ubbl.blog', 'b')
      .where('u.id = :id', {
        id,
      })
      .getOne();
  }

  async findUserToBanById(
    id: string,
    manager: EntityManager,
  ): Promise<User | null> {
    return await manager
      .createQueryBuilder(User, 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .leftJoinAndSelect('u.userBanByBlogger', 'ubbl')
      .where('u.id = :id', {
        id,
      })
      .getOne();
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
    manager: EntityManager,
  ): Promise<User | null> {
    return await manager
      .createQueryBuilder(User, 'u')
      .where(
        `${
          loginOrEmail
            ? `(u.login like :login OR u.email like :email)`
            : 'u.login is not null'
        }`,
        {
          login: loginOrEmail,
          email: loginOrEmail,
        },
      )
      .getOne();
  }

  async findUserByConfirmationCode(
    code: string,
    manager: EntityManager,
  ): Promise<any | null> {
    return await manager
      .createQueryBuilder(User, 'u')
      .where(`u.confirmationCode = :confirmationCode`, {
        confirmationCode: code,
      })
      .getOne();
  }

  async deleteUser(id: string, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(User, 'u')
      .delete()
      .from(User)
      .where('id = :id', {
        id,
      })
      .execute();

    return !!result.affected;
  }
}
