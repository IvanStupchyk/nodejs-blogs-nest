import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { isUUID } from '../utils';
import { UsersRepository } from '../../infrastructure/repositories/users/users.repository';

@ValidatorConstraint({ name: 'isUserExist', async: true })
@Injectable()
export class IsUserExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}
  async validate(userId: any) {
    if (!isUUID(userId)) return false;

    return !!(await this.usersRepository.fetchAllUserDataById(userId));
  }
}

export const isUserExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserExistConstraint,
    });
  };
