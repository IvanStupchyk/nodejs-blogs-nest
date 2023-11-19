import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../types/general.types';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesRepository } from '../repositories/likes.repository';
import { PostModel } from '../../controllers/posts/models/Post.model';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { mockPostModel } from '../../constants/blanks';
import { PostsType } from '../../types/posts.types';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likesRepository: LikesRepository,
  ) {}

  async createPost(newPost: PostModel): Promise<PostViewModel> {
    const {
      id,
      title,
      content,
      blogId,
      blogName,
      createdAt,
      shortDescription,
    } = newPost;

    await this.dataSource.query(
      `
        insert into public.posts("id", "title", "content", "blogId", "blogName", "createdAt", "shortDescription")
        values ($1, $2, $3, $4, $5, $6, $7)
        returning "id", "title", "content", "blogId", "blogName", "createdAt", "shortDescription"
    `,
      [id, title, content, blogId, blogName, createdAt, shortDescription],
    );

    return {
      id,
      title,
      content,
      blogId,
      blogName,
      createdAt,
      shortDescription,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    };
  }

  async getSortedPosts(
    params: GetSortedPostsModel,
    userId: string | undefined,
  ): Promise<PostsType> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockPostModel,
      });

    const posts = await this.dataSource.query(
      `
      select "id", "title", "content", "blogId", "blogName", "createdAt", "shortDescription", "likesCount", "dislikesCount"
      from public.posts
      order by "${sortBy}" ${sortDirection}
      limit $1 offset $2 
    `,
      [pageSize, skipSize],
    );

    const postsCount = await this.dataSource.query(
      `
    select "id"
    from public.posts`,
    );

    if (!postsCount.length) return null;

    const totalPostsCount = postsCount.length;
    const pagesCount = getPagesCount(totalPostsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: totalPostsCount,
      items: posts.map((p) => {
        return {
          id: p.id,
          title: p.title,
          shortDescription: p.shortDescription,
          content: p.content,
          blogId: p.blogId,
          blogName: p.blogName,
          createdAt: p.createdAt,
          extendedLikesInfo: {
            likesCount: p.likesCount,
            dislikesCount: p.dislikesCount,
            myStatus: likeStatus.None,
            newestLikes: [],
          },
        };
      }),
    };
  }

  async getPost(
    id: string,
    userLikeStatus: likeStatus,
  ): Promise<PostViewModel | null> {
    const post = await this.dataSource.query(
      `
      select "id", "title", "content", "blogId", "blogName", "createdAt", "shortDescription", "likesCount", "dislikesCount"
      from public.posts
      where("id" = $1)
    `,
      [id],
    );

    return post.length
      ? {
          id: post[0].id,
          title: post[0].title,
          shortDescription: post[0].shortDescription,
          content: post[0].content,
          blogId: post[0].blogId,
          blogName: post[0].blogName,
          createdAt: post[0].createdAt,
          extendedLikesInfo: {
            likesCount: post[0].likesCount,
            dislikesCount: post[0].dislikesCount,
            myStatus: userLikeStatus,
            newestLikes: [],
          },
        }
      : null;
  }

  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update public.posts
      set "title" = $2, "shortDescription" = $3, "content" = $4
      where "id" = $1
    `,
      [id, title, shortDescription, content],
    );

    return result[1] === 1;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        DELETE FROM public.posts
        WHERE "id" = $1;
        `,
      [id],
    );

    return result[1] === 1;
  }

  async deleteAllPosts() {
    return this.dataSource.query(`
    Delete from public.posts
    `);
  }
}
