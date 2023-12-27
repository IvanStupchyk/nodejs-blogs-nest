import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PostLike } from '../../../entities/posts/Post-like.entity';
import { Post } from '../../../entities/posts/Post.entity';

@Injectable()
export class PostLikesTransactionsRepository {
  async findPostLikesByUserIdAndPostId(
    userId: string,
    postId: string,
    manager: EntityManager,
  ): Promise<PostLike | null> {
    return await manager
      .createQueryBuilder(PostLike, 'l')
      .leftJoinAndSelect('l.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('l.userId = :userId', {
        userId,
      })
      .andWhere('l.postId = :postId', {
        postId,
      })
      .andWhere('ubi.isBanned is not true')
      .getOne();
  }

  async deleteAllPostLikes(manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(PostLike, 'l')
      .delete()
      .from(Post)
      .execute();

    return !!result.affected;
  }
}
