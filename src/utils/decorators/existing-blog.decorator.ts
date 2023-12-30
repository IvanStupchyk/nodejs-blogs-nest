import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { isUUID } from '../utils';
import { BlogsRepository } from '../../infrastructure/repositories/blogs/blogs.repository';

@ValidatorConstraint({ name: 'isBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async validate(blogId: any) {
    if (!blogId) return false;
    if (!isUUID(blogId)) return false;

    return !!(await this.blogsRepository.findBlogById(blogId));
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
