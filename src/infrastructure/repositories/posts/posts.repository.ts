import { Injectable } from '@nestjs/common';
import { likeStatus } from '../../../types/general.types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { PostsQueryDto } from '../../../application/dto/posts/posts.query.dto';
import { mockPostModel } from '../../../constants/blanks';
import { PostsType, PostViewType } from '../../../types/posts.types';
import { Post } from '../../../entities/posts/Post.entity';
import { PostLike } from '../../../entities/posts/Post-like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

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
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere("lk.likeStatus = 'Like'"),
        'likes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere("lk.likeStatus = 'Dislike'"),
        'dislikes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('like_status')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere('lk.userId = :userId', { userId }),
        'my_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`added_at, u.id, u.login`)
                .from(PostLike, 'pl')
                .leftJoin('pl.user', 'u')
                .where('pl.postId = p.id')
                .andWhere(`pl.like_status = 'Like'`)
                .orderBy('added_at', 'DESC')
                .limit(3);
            }, 'agg'),

        'newest_likes',
      )
      .where('ubi.isBanned is not true')
      .orderBy(`p.${sortBy}`, sortDirection)
      .offset(skipSize)
      .limit(pageSize)
      .getRawMany();

    const postsCount = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('ubi.isBanned is not true')
      .getCount();

    const pagesCount = getPagesCount(postsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: this._postsMapper(posts),
    };
  }

  async getPost(id: string, userId: string): Promise<PostViewType | null> {
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = :id', { id })
            .andWhere("lk.likeStatus = 'Like'"),
        'likes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = :id', { id })
            .andWhere("lk.likeStatus = 'Dislike'"),
        'dislikes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('like_status')
            .from(PostLike, 'lk')
            .where('lk.postId = :id', { id })
            .andWhere('lk.userId = :userId', { userId }),
        'my_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`added_at, u.id, u.login`)
                .from(PostLike, 'pl')
                .leftJoin('pl.user', 'u')
                .where('pl.postId = p.id')
                .andWhere(`pl.like_status = 'Like'`)
                .orderBy('added_at', 'DESC')
                .limit(3);
            }, 'agg'),

        'newest_likes',
      )
      .where('p.id = :id', {
        id,
      })
      .andWhere('ubi.isBanned is not true')
      .getRawMany();

    if (!post.length) {
      return null;
    } else {
      const mappedPost = this._postsMapper(post);
      return mappedPost[0];
    }
  }

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
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere("lk.likeStatus = 'Like'"),
        'likes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('count(*)')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere("lk.likeStatus = 'Dislike'"),
        'dislikes_count',
      )
      .addSelect(
        (l) =>
          l
            .select('like_status')
            .from(PostLike, 'lk')
            .where('lk.postId = p.id')
            .andWhere('lk.userId = :userId', { userId }),
        'my_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`added_at, u.id, u.login`)
                .from(PostLike, 'pl')
                .leftJoin('pl.user', 'u')
                .where('pl.postId = p.id')
                .andWhere(`pl.like_status = 'Like'`)
                .orderBy('added_at', 'DESC')
                .limit(3);
            }, 'agg'),

        'newest_likes',
      )
      .where('b.id = :id', {
        id,
      })
      .andWhere('ubi.isBanned is not true')
      .orderBy(`p.${sortBy}`, sortDirection)
      .offset(skipSize)
      .limit(pageSize)
      .getRawMany();

    const postsCount = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('b.id = :id', {
        id,
      })
      .andWhere('ubi.isBanned is not true')
      .getCount();

    if (!postsCount) return null;

    const pagesCount = getPagesCount(postsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: this._postsMapper(posts),
    };
  }

  async findPostById(id: string): Promise<Post | null> {
    return await this.postsRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .getOne();
  }

  private _postsMapper(posts: Array<any>): Array<PostViewType> {
    return posts.length
      ? posts.map((p) => {
          return {
            id: p.p_id.toString(),
            title: p.p_title,
            shortDescription: p.p_shortDescription,
            content: p.p_content,
            blogId: p.b_id,
            blogName: p.b_name,
            createdAt: p.p_createdAt,
            extendedLikesInfo: {
              likesCount: Number(p.likes_count),
              dislikesCount: Number(p.dislikes_count),
              myStatus: p.my_status ?? likeStatus.None,
              newestLikes: p.newest_likes ?? [],
            },
          };
        })
      : [];
  }
}
