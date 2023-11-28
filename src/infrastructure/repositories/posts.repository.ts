import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../types/general.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { PostsQueryDto } from '../../dto/posts/posts.query.dto';
import { mockPostModel } from '../../constants/blanks';
import { PostsType, PostViewType } from '../../types/posts.types';
import { Post } from '../../entities/posts/Post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async createPost(newPost: Post): Promise<PostViewType> {
    const savedPost = await this.postsRepository.save(newPost);

    return {
      id: savedPost.id,
      title: savedPost.title,
      content: savedPost.content,
      blogId: savedPost.blog,
      blogName: savedPost.blogName,
      createdAt: savedPost.createdAt,
      shortDescription: savedPost.shortDescription,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus.None,
        newestLikes: [],
      },
    };
  }

  async save(post: Post): Promise<boolean> {
    return !!(await this.postsRepository.save(post));
  }

  // async getSortedPosts(
  //   params: PostsQueryDto,
  //   userId: string,
  // ): Promise<PostsType> {
  //   const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
  //     createDefaultSortedParams({
  //       sortBy: params.sortBy,
  //       sortDirection: params.sortDirection,
  //       pageNumber: params.pageNumber,
  //       pageSize: params.pageSize,
  //       model: mockPostModel,
  //     });
  //
  //   const posts = await this.dataSource.query(
  //     `
  //     select p."id",
  //     p."title",
  //     p."content",
  //     p."blogId",
  //     p."blogName",
  //     p."createdAt",
  //     p."shortDescription",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Like'
  //       and "postId" = p."id"
  //     ) as "likesCount",
  //           (
  //       select "myStatus"
  //       from public."postLikes"
  //       where "userId" = $3
  //       and "postId" = p."id"
  //     ) as "userStatus",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Dislike'
  //       and "postId" = p."id"
  //     ) as "dislikesCount",
  //                         ( select jsonb_agg(json_build_object('addedAt', to_char(
  //                         agg."addedAt"::timestamp at time zone 'UTC',
  //                         'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
  //                                                  'login', agg."login")
  //                                order by "addedAt" desc)
  //               from ( select "addedAt", "id", "login", "userId"
  //                      from public."postLikes"
  //                      where "postId" = p.id
  //                      and "myStatus" = 'Like'
  //                      order by "addedAt" desc
  //                      limit 3 ) as agg )  as "newestLikes"
  //     from public.posts p
  //        order by "${sortBy}" ${sortDirection}
  //        limit $1 offset $2
  //   `,
  //     [pageSize, skipSize, userId],
  //   );
  //
  //   const postsCount = await this.dataSource.query(
  //     `
  //   select "id"
  //   from public.posts`,
  //   );
  //
  //   const totalPostsCount = postsCount.length;
  //   const pagesCount = getPagesCount(totalPostsCount, pageSize);
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount: totalPostsCount,
  //     items: posts.map((p) => {
  //       return {
  //         id: p.id,
  //         title: p.title,
  //         shortDescription: p.shortDescription,
  //         content: p.content,
  //         blogId: p.blogId,
  //         blogName: p.blogName,
  //         createdAt: p.createdAt,
  //         extendedLikesInfo: {
  //           likesCount: Number(p.likesCount),
  //           dislikesCount: Number(p.dislikesCount),
  //           myStatus: p.userStatus ?? likeStatus.None,
  //           newestLikes: p.newestLikes ?? [],
  //         },
  //       };
  //     }),
  //   };
  // }

  async getSortedPosts(
    params: PostsQueryDto,
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

    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .orderBy(`p.${sortBy}`, sortDirection)
      .offset(skipSize)
      .limit(pageSize)
      .getRawMany();

    const postsCount = await this.postsRepository
      .createQueryBuilder('p')
      .getCount();

    const pagesCount = getPagesCount(postsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts.map((p) => {
        return {
          id: p.p_id,
          title: p.p_title,
          shortDescription: p.p_shortDescription,
          content: p.p_content,
          blogId: p.b_id,
          blogName: p.b_name,
          createdAt: p.p_createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
            newestLikes: [],
          },
        };
      }),
    };
  }

  // async getPost(id: string, userId: string): Promise<PostViewType | null> {
  //   const post = await this.dataSource.query(
  //     `
  //     select p."id",
  //     p."title",
  //     p."content",
  //     p."blogId",
  //     p."blogName",
  //     p."createdAt",
  //     p."shortDescription",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Like'
  //       and "postId" = p."id"
  //     ) as "likesCount",
  //     (
  //       select "myStatus"
  //       from public."postLikes"
  //       where "userId" = $2
  //       and "postId" = $1
  //     ) as "userStatus",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Dislike'
  //       and "postId" = p."id"
  //     ) as "dislikesCount",
  //                   ( select jsonb_agg(json_build_object('addedAt', to_char(
  //                         agg."addedAt"::timestamp at time zone 'UTC',
  //                         'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
  //                                                  'login', agg."login")
  //                                order by "addedAt" desc)
  //               from ( select "addedAt", "id", "login", "userId"
  //                      from public."postLikes"
  //                      where "postId" = p.id
  //                      and "myStatus" = 'Like'
  //                      order by "addedAt" desc
  //                      limit 3 ) as agg )  as "newestLikes"
  //     from public.posts p
  //      where p."id" = $1
  //   `,
  //     [id, userId],
  //   );
  //
  //   return post.length
  //     ? {
  //         id: post[0].id,
  //         title: post[0].title,
  //         shortDescription: post[0].shortDescription,
  //         content: post[0].content,
  //         blogId: post[0].blogId,
  //         blogName: post[0].blogName,
  //         createdAt: post[0].createdAt,
  //         extendedLikesInfo: {
  //           likesCount: Number(post[0].likesCount),
  //           dislikesCount: Number(post[0].dislikesCount),
  //           myStatus: post[0].userStatus ?? likeStatus.None,
  //           newestLikes: post[0].newestLikes ?? [],
  //         },
  //       }
  //     : null;
  // }

  async getPost(id: string, userId: string): Promise<PostViewType | null> {
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('p.id = :id', {
        id,
      })
      .getRawOne();

    return post
      ? {
          id: post.p_id,
          title: post.p_title,
          shortDescription: post.p_shortDescription,
          content: post.p_content,
          blogId: post.b_id,
          blogName: post.b_name,
          createdAt: post.p_createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
            newestLikes: [],
          },
        }
      : null;

    // return post
    //   ? {
    //       id: post.id,
    //       title: post.title,
    //       shortDescription: post.shortDescription,
    //       content: post.content,
    //       blogId: post.blog,
    //       blogName: post.blogName,
    //       createdAt: post.createdAt,
    //       extendedLikesInfo: {
    //         likesCount: Number(post.likesCount),
    //         dislikesCount: Number(post.dislikesCount),
    //         myStatus: post.userStatus ?? likeStatus.None,
    //         newestLikes: post.newestLikes ?? [],
    //       },
    //     }
    //   : null;
  }

  // async getPostsByIdForSpecificBlog(
  //   params: PostsQueryDto,
  //   id: string,
  //   userId: string | undefined,
  // ): Promise<PostsType | null> {
  //   const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
  //     createDefaultSortedParams({
  //       sortBy: params.sortBy,
  //       sortDirection: params.sortDirection,
  //       pageNumber: params.pageNumber,
  //       pageSize: params.pageSize,
  //       model: mockPostModel,
  //     });
  //
  //   const posts = await this.dataSource.query(
  //     `
  //     select p."id",
  //     p."title",
  //     p."content",
  //     p."blogId",
  //     p."blogName",
  //     p."createdAt",
  //     p."shortDescription",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Like'
  //       and "postId" = p."id"
  //     ) as "likesCount",
  //     (
  //       select "myStatus"
  //       from public."postLikes"
  //       where "userId" = $3
  //       and "postId" = p."id"
  //     ) as "userStatus",
  //     (
  //       select count("myStatus")
  //       from public."postLikes"
  //       where "myStatus" = 'Dislike'
  //       and "postId" = p."id"
  //     ) as "dislikesCount",
  //                         ( select jsonb_agg(json_build_object('addedAt', to_char(
  //                         agg."addedAt"::timestamp at time zone 'UTC',
  //                         'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg."userId",
  //                                                  'login', agg."login")
  //                                order by "addedAt" desc)
  //               from ( select "addedAt", "id", "login", "userId"
  //                      from public."postLikes"
  //                      where "postId" = p.id
  //                      and "myStatus" = 'Like'
  //                      order by "addedAt" desc
  //                      limit 3 ) as agg )  as "newestLikes"
  //     from public.posts p
  //        where "blogId" = $4
  //        order by "${sortBy}" ${sortDirection}
  //        limit $1 offset $2
  //   `,
  //     [pageSize, skipSize, userId, id],
  //   );
  //
  //   const postsCount = await this.dataSource.query(
  //     `
  //   select "id", "blogId"
  //   from public.posts
  //   where ("blogId" = $1)`,
  //     [id],
  //   );
  //
  //   if (!postsCount.length) return null;
  //
  //   const totalPostsCount = postsCount.length;
  //   const pagesCount = getPagesCount(totalPostsCount, pageSize);
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount: totalPostsCount,
  //     items: posts.map((p) => {
  //       return {
  //         id: p.id,
  //         title: p.title,
  //         shortDescription: p.shortDescription,
  //         content: p.content,
  //         blogId: p.blogId,
  //         blogName: p.blogName,
  //         createdAt: p.createdAt,
  //         extendedLikesInfo: {
  //           likesCount: Number(p.likesCount),
  //           dislikesCount: Number(p.dislikesCount),
  //           myStatus: p.userStatus ?? likeStatus.None,
  //           newestLikes: p.newestLikes ?? [],
  //         },
  //       };
  //     }),
  //   };
  // }

  async getPostsByIdForSpecificBlog(
    params: PostsQueryDto,
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

    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('b.id = :id', {
        id,
      })
      .orderBy(`p.${sortBy}`, sortDirection)
      .offset(skipSize)
      .limit(pageSize)
      .getRawMany();

    const postsCount = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('b.id = :id', {
        id,
      })
      .getCount();

    if (!postsCount) return null;

    const pagesCount = getPagesCount(postsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts.map((p) => {
        return {
          id: p.p_id,
          title: p.p_title,
          shortDescription: p.p_shortDescription,
          content: p.p_content,
          blogId: p.b_id,
          blogName: p.b_name,
          createdAt: p.p_createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
            newestLikes: [],
          },
        };
      }),
    };
  }

  async findPostById(id: string): Promise<Post | null> {
    return await this.postsRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .getOne();
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .delete()
      .from(Post)
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async deleteAllPosts(): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .delete()
      .from(Post)
      .execute();

    return !!result.affected;
  }
}
