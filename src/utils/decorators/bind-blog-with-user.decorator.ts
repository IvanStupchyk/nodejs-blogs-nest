import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { isUUID } from '../utils';
import { BlogsRepository } from '../../infrastructure/repositories/blogs/blogs.repository';

@ValidatorConstraint({ name: 'isBlogHasOwner', async: true })
@Injectable()
export class isBlogHasOwnerDataConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async validate(blogId: any) {
    if (!isUUID(blogId)) return false;

    const blog = await this.blogsRepository.findBlogById(blogId);

    return !!blog.user_id;
  }
}

export const isBlogHasOwner =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: isBlogHasOwnerDataConstraint,
    });
  };
