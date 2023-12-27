import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../../types/general.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockCommentModel } from '../../../constants/blanks';
import { CommentsQueryDto } from '../../../application/dto/comments/comments.query.dto';
import {
  CommentsViewType,
  CommentViewType,
} from '../../../types/comments.types';
import { Comment } from '../../../entities/comments/Comment.entity';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findCommentById(
    id: string,
    userId: string = uuidv4(),
  ): Promise<CommentViewType | null> {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .addSelect(
        (lk) =>
          lk
            .select('count(*)')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Like'"),
        'likes_count',
      )
      .addSelect(
        (lk) =>
          lk
            .select('count(*)')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Dislike'"),
        'dislikes_count',
      )
      .addSelect(
        (lk) =>
          lk
            .select('like_status')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere('cl.userId = :userId', { userId }),
        'my_status',
      )
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .leftJoinAndSelect('c.post', 'p')
      .where('c.id = :id', { id })
      .andWhere('ubi.isBanned is not true')
      .getRawOne();

    return comment
      ? {
          id: comment.c_id,
          content: comment.c_content,
          commentatorInfo: {
            userId: comment.u_id,
            userLogin: comment.u_login,
          },
          likesInfo: {
            likesCount: Number(comment.likes_count),
            dislikesCount: Number(comment.dislikes_count),
            myStatus: comment.my_status ?? likeStatus.None,
          },
          createdAt: comment.c_createdAt,
        }
      : null;
  }

  async getSortedComments(
    params: CommentsQueryDto,
    postId: string,
    userId: string = uuidv4(),
  ): Promise<CommentsViewType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockCommentModel,
      });

    const comments = await this.commentsRepository
      .createQueryBuilder('c')
      .addSelect(
        (lk) =>
          lk
            .select('count(*)')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Like'"),
        'likes_count',
      )
      .addSelect(
        (lk) =>
          lk
            .select('count(*)')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Dislike'"),
        'dislikes_count',
      )
      .addSelect(
        (lk) =>
          lk
            .select('like_status')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere('cl.userId = :userId', { userId }),
        'my_status',
      )
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .leftJoinAndSelect('c.post', 'p')
      .where('p.id = :postId', { postId })
      .andWhere('ubi.isBanned is not true')
      .orderBy(`c.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(skipSize)
      .getRawMany();

    const commentsCount = await this.commentsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.post', 'p')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('p.id = :postId', { postId })
      .andWhere('ubi.isBanned is not true')
      .getCount();

    if (!commentsCount) return null;

    const pagesCount = getPagesCount(commentsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: comments.map((c) => {
        return {
          id: c.c_id,
          content: c.c_content,
          commentatorInfo: {
            userId: c.u_id,
            userLogin: c.u_login,
          },
          likesInfo: {
            likesCount: Number(c.likes_count),
            dislikesCount: Number(c.dislikes_count),
            myStatus: c.my_status ?? likeStatus.None,
          },
          createdAt: c.c_createdAt,
        };
      }),
    };
  }
}
