import { Injectable } from '@nestjs/common';
import {
  createDefaultSortedParams,
  getPagesCount,
  isUUID,
} from '../../utils/utils';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { mockPostModel } from '../../constants/blanks';
import { PostsType } from '../../types/posts.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesRepository } from '../repositories/likes.repository';
import { likeStatus } from '../../types/general.types';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(
    private likesRepository: LikesRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async findPostsByIdForSpecificBlog(
    params: GetSortedPostsModel,
    id: string,
    userId: string | undefined,
  ): Promise<PostsType | null> {
    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockPostModel,
      });

    if (!isUUID(id)) return null;

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
    select "id", "blogId"
    from public.posts
    where ("blogId" = $1)`,
      [id],
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
}
