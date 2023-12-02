import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../entities/posts/Post.entity';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
  ) {}

  async findCommentLikesByUserIdAndCommentId(
    userId: string,
    commentId: string,
  ): Promise<CommentLike | null> {
    return await this.commentLikesRepository
      .createQueryBuilder('c')
      .where('c.commentId = :commentId', { commentId })
      .andWhere('c.userId = :userId', { userId })
      .getOne();
  }

  async deleteAllCommentLikes(): Promise<boolean> {
    const result = await this.commentLikesRepository
      .createQueryBuilder('c')
      .delete()
      .from(Post)
      .execute();

    return !!result.affected;
  }
}
