import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Post } from '../../../entities/posts/Post.entity';
import { PostImageViewType } from '../../../types/posts/post.image.types';

@Injectable()
export class PostsTransactionsRepository {
  async findPostById(id: string, manager: EntityManager): Promise<Post | null> {
    return await manager
      .createQueryBuilder(Post, 'p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('p.id = :id', { id })
      .getOne();
  }

  async findPostImages(
    id: string,
    manager: EntityManager,
  ): Promise<PostImageViewType> {
    const images = await manager
      .createQueryBuilder(Post, 'p')
      .leftJoinAndSelect('p.postImages', 'pi')
      .where('p.id = :id', { id })
      .getOne();

    return {
      main: images.postImages.length
        ? images.postImages.map((i) => {
            return {
              url: i.url,
              width: i.width,
              height: i.height,
              fileSize: i.fileSize,
            };
          })
        : [],
    };
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
