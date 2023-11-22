import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLikeModel } from '../../models/comments/Comment-like.model';

@Injectable()
export class CommentLikesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findCommentLikesByUserIdAndCommentId(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeModel | null> {
    const likes = await this.dataSource.query(
      `
      select "id", "userId", "commentId", "myStatus", "createdAt"
      from public."commentLikes"
      where ("commentId" = $1)
      and ("userId" = $2)
    `,
      [commentId, userId],
    );

    return likes[0];
  }

  async updateExistingCommentLike(
    userId: string,
    commentId: string,
    myStatus: string,
  ): Promise<boolean> {
    const response = await this.dataSource.query(
      `
      update public."commentLikes"
      set "myStatus" = $1
      where ("commentId" = $2)
      and ("userId" = $3)
    `,
      [myStatus, commentId, userId],
    );

    return !!response[1];
  }

  async addCommentLike(newCommentLike: CommentLikeModel): Promise<boolean> {
    const { id, userId, commentId, myStatus, createdAt } = newCommentLike;

    await this.dataSource.query(
      `
      insert into public."commentLikes"("id", "userId", "commentId", "myStatus", "createdAt")
      values($1, $2, $3, $4, $5)
    `,
      [id, userId, commentId, myStatus, createdAt],
    );

    return true;
  }

  async deleteCommentLike(id: string): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
      DELETE from public."commentLikes"
      where("id" = $1)
    `,
      [id],
    );

    return !!isDeleted[1];
  }

  async deleteAllCommentLikesAndDislikes(commentId: string): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
      DELETE from public."commentLikes"
      where("commentId" = $1)
    `,
      [commentId],
    );

    return !!isDeleted[1];
  }

  async deleteAllCommentLikes() {
    return this.dataSource.query(`
    Delete from public."commentLikes"
    `);
  }
}
