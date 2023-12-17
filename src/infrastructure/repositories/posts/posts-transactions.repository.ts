import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Post } from '../../../entities/posts/Post.entity';

@Injectable()
export class PostsTransactionsRepository {
  async findPostById(id: string, manager: EntityManager): Promise<Post | null> {
    return await manager
      .createQueryBuilder(Post, 'p')
      .where('p.id = :id', { id })
      .getOne();
  }

  async deletePost(id: string, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(Post, 'p')
      .delete()
      .from(Post)
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }
}
