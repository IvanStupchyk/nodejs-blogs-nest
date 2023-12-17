import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Comment } from '../../../entities/comments/Comment.entity';

@Injectable()
export class CommentsTransactionsRepository {
  async fetchAllCommentDataById(
    id: string,
    manager: EntityManager,
  ): Promise<Comment | null> {
    return await manager
      .createQueryBuilder(Comment, 'c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.id = :id', { id })
      .getOne();
  }

  async deleteComment(
    commentId: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const isDeleted = await manager
      .createQueryBuilder(Comment, 'c')
      .delete()
      .from(Comment)
      .where('id = :id', { id: commentId })
      .execute();

    return !!isDeleted.affected;
  }
}
