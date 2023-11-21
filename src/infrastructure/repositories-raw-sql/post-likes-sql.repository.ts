import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeModel } from '../../controllers/posts/models/Post-like.model';

@Injectable()
export class PostLikesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostLikesByUserIdAndPostId(
    userId: string,
    postId: string,
  ): Promise<PostLikeModel | null> {
    const likes = await this.dataSource.query(
      `
      select "id", "userId", "login", "myStatus", "postId", "addedAt", "createdAt"
      from public."postLikes"
      where ("postId" = $1)
      and ("userId" = $2)
    `,
      [postId, userId],
    );

    return likes[0];
  }

  async updateExistingPostLike(
    userId: string,
    postId: string,
    myStatus: string,
    addedAt: string,
  ): Promise<boolean> {
    const response = await this.dataSource.query(
      `
      update public."postLikes"
      set "myStatus" = $3, "addedAt" = $4
      where ("postId" = $1)
      and ("userId" = $2)
    `,
      [postId, userId, myStatus, addedAt],
    );

    return !!response[1];
  }

  async addPostLike(newPostLike: PostLikeModel): Promise<boolean> {
    const { id, userId, login, postId, myStatus, addedAt, createdAt } =
      newPostLike;

    await this.dataSource.query(
      `
      insert into public."postLikes"("id", "userId", "login", "postId", "myStatus", "addedAt", "createdAt")
      values($1, $2, $3, $4, $5, $6, $7)
    `,
      [id, userId, login, postId, myStatus, addedAt, createdAt],
    );

    return true;
  }

  async deletePostLike(id: string): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
      DELETE from public."postLikes"
      where("id" = $1)
    `,
      [id],
    );

    return !!isDeleted[1];
  }

  async deleteAllPostLikesAndDislikes(postId: string): Promise<boolean> {
    const isDeleted = await this.dataSource.query(
      `
      DELETE from public."postLikes"
      where("postId" = $1)
    `,
      [postId],
    );

    return !!isDeleted[1];
  }

  async deleteAllPostLikes() {
    return this.dataSource.query(`
    Delete from public."postLikes"
    `);
  }
}
