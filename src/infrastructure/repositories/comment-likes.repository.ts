import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/posts/Post.entity';
import { CommentLike } from '../../entities/comments/Comment-like.entity';

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

  async save(commentLike: CommentLike): Promise<CommentLike> {
    return await this.commentLikesRepository.save(commentLike);
  }

  async deleteCommentLike(id: string): Promise<boolean> {
    const isDeleted = await this.commentLikesRepository
      .createQueryBuilder('c')
      .delete()
      .from(CommentLike)
      .where('id = :id', { id })
      .execute();

    return !!isDeleted.affected;
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
