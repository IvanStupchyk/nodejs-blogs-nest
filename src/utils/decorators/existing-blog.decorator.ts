import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { isUUID } from '../utils';
import { BlogsSqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-sql.repository';

@ValidatorConstraint({ name: 'isBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async validate(blogId: any) {
    if (!isUUID(blogId)) return false;

    return !!(await this.blogsSqlRepository.findBlogById(blogId));
  }
}

export const isBlogExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogExistConstraint,
    });
  };
