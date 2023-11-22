import { Injectable } from '@nestjs/common';
import { CommentsType, likeStatus } from '../../types/general.types';
import { CommentViewType } from '../../types/comment-view.type';
import { CommentModel } from '../../models/comments/Comment.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockCommentModel } from '../../constants/blanks';
import { CommentsQueryDto } from '../../dto/comments/comments.query.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findCommentById(
    id: string,
    userId: string = uuidv4(),
  ): Promise<CommentViewType | null> {
    const foundComment: Array<
      CommentModel & {
        likesCount: number;
        dislikesCount: number;
        userStatus: likeStatus;
      }
    > = await this.dataSource.query(
      `
      select c."id", c."content", c."postId", c."userId", c."userLogin", c."createdAt" ,
       ( 
        select count("myStatus")
        from public."commentLikes"
        where "myStatus" = 'Like'
        and "commentId" = c."id"
      ) as "likesCount",
      ( 
        select "myStatus"
        from public."commentLikes"
        where "userId" = $2
        and "commentId" = c."id"
      ) as "userStatus",
      ( 
        select count("myStatus")
        from public."commentLikes"
        where "myStatus" = 'Dislike'
        and "commentId" = c."id"
      ) as "dislikesCount"
      from public."comments" c
      where "id" = $1
    `,
      [id, userId],
    );

    return foundComment.length
      ? {
          id: foundComment[0].id,
          content: foundComment[0].content,
          commentatorInfo: {
            userId: foundComment[0].userId,
            userLogin: foundComment[0].userLogin,
          },
          likesInfo: {
            likesCount: Number(foundComment[0].likesCount),
            dislikesCount: Number(foundComment[0].dislikesCount),
            myStatus: foundComment[0].userStatus ?? likeStatus.None,
          },
          createdAt: foundComment[0].createdAt,
        }
      : null;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
      DELETE from public."comments"
      where "id" = $1
    `,
      [commentId],
    );

    return !!isDeleted[1];
  }

  async getSortedComments(
    params: CommentsQueryDto,
    postId: string,
    userId: string = uuidv4(),
  ): Promise<CommentsType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockCommentModel,
      });

    const comments = await this.dataSource.query(
      `
      select c."id", c."content", c."postId", c."userId", c."userLogin", c."createdAt" ,
       ( 
        select count("myStatus")
        from public."commentLikes"
        where "myStatus" = 'Like'
        and "commentId" = c."id"
      ) as "likesCount",
      ( 
        select "myStatus"
        from public."commentLikes"
        where "userId" = $3
        and "commentId" = c."id"
      ) as "userStatus",
      ( 
        select count("myStatus")
        from public."commentLikes"
        where "myStatus" = 'Dislike'
        and "commentId" = c."id"
      ) as "dislikesCount"
      from public."comments" c
      where "postId" = $4
         order by "${sortBy}" ${sortDirection}
         limit $1 offset $2 
    `,
      [pageSize, skipSize, userId, postId],
    );

    const commentsCount = await this.dataSource.query(
      `
    select "id", "postId"
    from public."comments"
    where ("postId" = $1)`,
      [postId],
    );

    if (!commentsCount.length) return null;

    const totalCommentsCount = commentsCount.length;
    const pagesCount = getPagesCount(totalCommentsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: totalCommentsCount,
      items: comments.map((c) => {
        return {
          id: c.id,
          content: c.content,
          commentatorInfo: {
            userId: c.userId,
            userLogin: c.userLogin,
          },
          likesInfo: {
            likesCount: Number(c.likesCount),
            dislikesCount: Number(c.dislikesCount),
            myStatus: c.userStatus ?? likeStatus.None,
          },
          createdAt: c.createdAt,
        };
      }),
    };
  }

  async createComment(comment: CommentModel): Promise<CommentViewType> {
    const { id, content, postId, userId, userLogin, createdAt } = comment;

    const newComment: CommentModel = await this.dataSource.query(
      `
      insert into public."comments"("id", "content", "postId", "userId", "userLogin", "createdAt")
      values($1, $2, $3, $4, $5, $6)
      returning "id", "content", "postId", "userId", "userLogin", "createdAt"  `,
      [id, content, postId, userId, userLogin, createdAt],
    );

    return {
      id: newComment[0].id,
      content: newComment[0].content,
      commentatorInfo: {
        userId: newComment[0].userId,
        userLogin: newComment[0].userLogin,
      },
      createdAt: newComment[0].createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
      },
    };
  }

  async updateComment(content: string, id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update public."comments"
      set "content" = $1
      where "id" = $2 
    `,
      [content, id],
    );

    return !!result[1];
  }

  async deleteAllComments() {
    return this.dataSource.query(`
    Delete from public."comments"
    `);
  }
}
