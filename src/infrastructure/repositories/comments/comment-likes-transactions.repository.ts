import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Post } from '../../../entities/posts/Post.entity';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';

@Injectable()
export class CommentLikesTransactionsRepository {
  async findCommentLikesByUserIdAndCommentId(
    userId: string,
    commentId: string,
    manager: EntityManager,
  ): Promise<CommentLike | null> {
    return await manager
      .createQueryBuilder(CommentLike, 'c')
      .where('c.commentId = :commentId', { commentId })
      .andWhere('c.userId = :userId', { userId })
      .getOne();
  }

  async deleteAllCommentLikes(manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(CommentLike, 'c')
      .delete()
      .from(Post)
      .execute();

    return !!result.affected;
  }
}
