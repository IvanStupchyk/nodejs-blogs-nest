import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../types/general.types';
import { PostViewModel } from '../../controllers/posts/models/post-view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostModel } from '../../controllers/posts/models/Post.model';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { GetSortedPostsModel } from '../../controllers/posts/models/get-sorted-posts.model';
import { mockPostModel } from '../../constants/blanks';
import { PostsType } from '../../types/posts.types';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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
    userId: string,
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
      select p."id", 
      p."title", 
      p."content", 
      p."blogId", 
      p."blogName", 
      p."createdAt", 
      p."shortDescription",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Like'
        and "postId" = p."id"
      ) as "likesCount",
            ( 
        select "myStatus"
        from public."postLikes"
        where "userId" = $3
        and "postId" = p."id"
      ) as "userStatus",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Dislike'
        and "postId" = p."id"
      ) as "dislikesCount",
                          ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
                                                   'login', agg."login")
                                 order by "addedAt" desc)
                from ( select "addedAt", "id", "login", "userId"
                       from public."postLikes" 
                       where "postId" = p.id
                       and "myStatus" = 'Like'
                       order by "addedAt" desc
                       limit 3 ) as agg )  as "newestLikes"
      from public.posts p
         order by "${sortBy}" ${sortDirection}
         limit $1 offset $2 
    `,
      [pageSize, skipSize, userId],
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
            likesCount: Number(p.likesCount),
            dislikesCount: Number(p.dislikesCount),
            myStatus: p.userStatus ?? likeStatus.None,
            newestLikes: p.newestLikes ?? [],
          },
        };
      }),
    };
  }

  async getPost(id: string, userId: string): Promise<PostViewModel | null> {
    const post = await this.dataSource.query(
      `
      select p."id", 
      p."title", 
      p."content", 
      p."blogId", 
      p."blogName", 
      p."createdAt", 
      p."shortDescription",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Like'
        and "postId" = p."id"
      ) as "likesCount",
      ( 
        select "myStatus"
        from public."postLikes"
        where "userId" = $2
        and "postId" = $1
      ) as "userStatus",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Dislike'
        and "postId" = p."id"
      ) as "dislikesCount",
                    ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
                                                   'login', agg."login")
                                 order by "addedAt" desc)
                from ( select "addedAt", "id", "login", "userId"
                       from public."postLikes" 
                       where "postId" = p.id
                       and "myStatus" = 'Like'
                       order by "addedAt" desc
                       limit 3 ) as agg )  as "newestLikes"
      from public.posts p
       where p."id" = $1   
    `,
      [id, userId],
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
            likesCount: Number(post[0].likesCount),
            dislikesCount: Number(post[0].dislikesCount),
            myStatus: post[0].userStatus ?? likeStatus.None,
            newestLikes: post[0].newestLikes ?? [],
          },
        }
      : null;
  }

  async getPostsByIdForSpecificBlog(
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

    const posts = await this.dataSource.query(
      `
      select p."id", 
      p."title", 
      p."content", 
      p."blogId", 
      p."blogName", 
      p."createdAt", 
      p."shortDescription",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Like'
        and "postId" = p."id"
      ) as "likesCount",
      ( 
        select "myStatus"
        from public."postLikes"
        where "userId" = $3
        and "postId" = p."id"
      ) as "userStatus",
      ( 
        select count("myStatus")
        from public."postLikes"
        where "myStatus" = 'Dislike'
        and "postId" = p."id"
      ) as "dislikesCount",
                          ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
                                                   'login', agg."login")
                                 order by "addedAt" desc)
                from ( select "addedAt", "id", "login", "userId"
                       from public."postLikes" 
                       where "postId" = p.id
                       and "myStatus" = 'Like'
                       order by "addedAt" desc
                       limit 3 ) as agg )  as "newestLikes"
      from public.posts p
         where "blogId" = $4
         order by "${sortBy}" ${sortDirection}
         limit $1 offset $2 
    `,
      [pageSize, skipSize, userId, id],
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
            likesCount: Number(p.likesCount),
            dislikesCount: Number(p.dislikesCount),
            myStatus: p.userStatus ?? likeStatus.None,
            newestLikes: p.newestLikes ?? [],
          },
        };
      }),
    };
  }

  async findPostById(id: string): Promise<PostModel | null> {
    const post = await this.dataSource.query(
      `
      select "id", "title", "content", "blogId", "blogName", "createdAt", "shortDescription"
      from public.posts
      where("id" = $1)
    `,
      [id],
    );

    return post[0];
  }

  async updatePost(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      update public.posts
      set "title" = $2, "shortDescription" = $3, "content" = $4
      where "id" = $1
    `,
      [id, title, shortDescription, content],
    );

    return !!result[1];
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
