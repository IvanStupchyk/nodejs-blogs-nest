import { Injectable } from '@nestjs/common';
import { ViewUserModel } from '../../controllers/users/models/view-user.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserType } from '../../types/rawSqlTypes/user';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    const {
      id,
      login,
      email,
      passwordHash,
      confirmationCode,
      expirationDate,
      isConfirmed,
      createdAt,
    } = newUser;

    const user = await this.dataSource.query(
      `
    INSERT INTO public.users(
    "id", "login", "email", "passwordHash", "confirmationCode", "expirationDate", "isConfirmed", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    returning "id", "login", "email", "createdAt";
    `,
      [
        id,
        login,
        email,
        passwordHash,
        confirmationCode,
        expirationDate,
        isConfirmed,
        createdAt,
      ],
    );

    return user[0];
  }

  async fetchAllUserDataById(id: string): Promise<UserType> {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "confirmationCode", "expirationDate", "isConfirmed", "createdAt"
    FROM public.users
        where ("id" = $1)
    `,
      [id],
    );

    return user[0];
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "confirmationCode", "expirationDate", "isConfirmed", "createdAt"
    FROM public.users
        where ("login" like $1 or "email" like $1)
    `,
      [loginOrEmail],
    );

    return user[0];
  }

  async findUserByConfirmationCode(code: string): Promise<any | null> {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "confirmationCode", "expirationDate", "isConfirmed"
    FROM public.users
        where ("confirmationCode" like $1)
    `,
      [code],
    );

    return user[0];
  }

  async confirmEmail(id: string): Promise<boolean> {
    const isConfirmed = await this.dataSource.query(
      `
    update public.users
    set "isConfirmed" = true
    where id = $1
    `,
      [id],
    );

    return isConfirmed[1] === 1;
  }

  async updateConfirmationCodeAndExpirationTime(
    id: string,
    newExpirationDate: string,
    newCode: string,
  ): Promise<boolean> {
    const isUpdated = await this.dataSource.query(
      `
    update public.users
    set "expirationDate" = $2, "confirmationCode" = $3
    where id = $1
    `,
      [id, newExpirationDate, newCode],
    );

    return isUpdated[1] === 1;
  }

  async changeUserPassword(
    newPasswordHash: string,
    id: string,
  ): Promise<boolean> {
    const isUpdated = await this.dataSource.query(
      `
      update public.users
      set "passwordHash" = $1
      where "id" = $2
    `,
      [newPasswordHash, id],
    );

    return !!isUpdated[1];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        DELETE FROM public.users
        WHERE "id" = $1;
        `,
      [id],
    );

    return !!result[1];
  }
}
