import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../../types/general.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockCommentModel } from '../../../constants/blanks';
import { CommentsQueryDto } from '../../../application/dto/comments/comments.query.dto';
import { CommentsBloggerViewType } from '../../../types/comments.types';
import { Comment } from '../../../entities/comments/Comment.entity';
import { CommentLike } from '../../../entities/comments/Comment-like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async getSortedBloggerComments(
    params: CommentsQueryDto,
    userId: string,
  ): Promise<CommentsBloggerViewType> {
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
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Like'")
            .andWhere('ubi.isBanned is not true'),
        'likes_count',
      )
      .addSelect(
        (lk) =>
          lk
            .select('count(*)')
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('c.id = cl.commentId')
            .andWhere("cl.likeStatus = 'Dislike'")
            .andWhere('ubi.isBanned is not true'),
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
      .where('u.id = :userId', { userId })
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
      // .where('u.id = :userId', { userId })
      // .andWhere('ubi.isBanned is not true')
      .getCount();

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
          postInfo: {
            id: c.p_id,
            title: c.p_title,
            blogId: c.p_blogId,
            blogName: c.p_blogName,
          },
          createdAt: c.c_createdAt,
        };
      }),
    };
  }
}
