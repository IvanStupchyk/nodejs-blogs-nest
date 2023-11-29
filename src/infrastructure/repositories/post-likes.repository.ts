import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from '../../entities/posts/Post-like.entity';
import { Post } from '../../entities/posts/Post.entity';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
  ) {}

  async save(postLike: PostLike): Promise<PostLike> {
    return await this.postLikesRepository.save(postLike);
  }

  async findPostLikesByUserIdAndPostId(
    userId: string,
    postId: string,
  ): Promise<PostLike | null> {
    return await this.postLikesRepository
      .createQueryBuilder('l')
      .where('l.userId = :userId', {
        userId,
      })
      .andWhere('l.postId = :postId', {
        postId,
      })
      .getOne();
  }

  async deletePostLike(id: string): Promise<boolean> {
    const isDeleted = await this.postLikesRepository
      .createQueryBuilder('l')
      .delete()
      .from(PostLike)
      .where('id = :id', { id })
      .execute();

    return !!isDeleted.affected;
  }

  async deleteAllPostLikes(): Promise<boolean> {
    const result = await this.postLikesRepository
      .createQueryBuilder('l')
      .delete()
      .from(Post)
      .execute();

    return !!result.affected;
  }
}
