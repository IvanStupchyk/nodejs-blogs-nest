import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/users/User.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async fetchAllUserDataById(id: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id = :id', {
        id,
      })
      .getOne();
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('u')
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

  async findUserByConfirmationCode(code: string): Promise<any | null> {
    return await this.usersRepository
      .createQueryBuilder('u')
      .where(`u.confirmationCode = :confirmationCode`, {
        confirmationCode: code,
      })
      .getOne();
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(User)
      .where('id = :id', {
        id,
      })
      .execute();

    return !!result.affected;
  }
}