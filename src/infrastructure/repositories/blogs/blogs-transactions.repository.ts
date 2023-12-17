import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';

@Injectable()
export class BlogsTransactionsRepository {
  async deleteBlog(id: string, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(Blog, 'b')
      .delete()
      .from(Blog)
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async findBlogById(id: string, manager: EntityManager): Promise<Blog | null> {
    return await manager
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.user', 'user')
      .where('b.id = :id', {
        id,
      })
      .getOne();
  }
}
