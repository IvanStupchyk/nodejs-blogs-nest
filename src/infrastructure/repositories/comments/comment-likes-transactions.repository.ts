import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
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
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('c.commentId = :commentId', { commentId })
      .andWhere('c.userId = :userId', { userId })
      .andWhere('ubi.isBanned is not true')
      .getOne();
  }
}
