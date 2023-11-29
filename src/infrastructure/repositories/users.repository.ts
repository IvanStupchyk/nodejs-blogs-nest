import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType, UserViewType } from '../../types/users.types';
import { User } from '../../entities/users/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(newUser: any): Promise<UserViewType> {
    const savedUser = (await this.usersRepository.save(newUser)) as User;

    return {
      id: savedUser.id,
      login: savedUser.login,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }

  async fetchAllUserDataById(id: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id = :id', {
        id,
      })
      .getOne();
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
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

  async save(data: UserType): Promise<boolean> {
    return !!(await this.usersRepository.save(data));
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
