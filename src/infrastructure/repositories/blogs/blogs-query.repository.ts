import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockBlogModel } from '../../../constants/blanks';
import { BlogsQueryDto } from '../../../application/dto/blogs/blogs.query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BlogsViewSAType,
  BlogsViewType,
} from '../../../types/blogs/blogs.types';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogMainImage } from '../../../entities/blogs/Blog-main-image.entity';
import { SubscriptionStatus } from '../../../constants/subscription-status.enum';
import { BlogSubscription } from '../../../entities/blogs/Blog-subscription.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async getSortedBlogs(
    params: BlogsQueryDto,
    userId?: string,
  ): Promise<BlogsViewType> {
    const { searchNameTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBlogModel,
      });

    const blogs = await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.blogWallpaper', 'wp')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'fileSize', agg.file_size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, file_size`)
                .from(BlogMainImage, 'bi')
                .where('bi.blogId = b.id');
            }, 'agg'),

        'blog_main_images',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere(`bs.subscriptionStatus = 'Subscribed'`),
        'subscribers_count',
      )
      .addSelect(
        (qb) =>
          qb
            .select('bs.subscriptionStatus')
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere('bs.userId = :userId', { userId }),
        'subscription_status',
      )
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
        },
      )
      .andWhere('b.isBanned = false')
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(skipSize)
      .getRawMany();

    const blogsCount = await this.blogRepository
      .createQueryBuilder('b')
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
        },
      )
      .andWhere('b.isBanned = false')
      .getCount();

    const pagesCount = getPagesCount(blogsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: blogs.length
        ? blogs.map((b) => {
            return {
              id: b.b_id,
              name: b.b_name,
              description: b.b_description,
              websiteUrl: b.b_websiteUrl,
              createdAt: b.b_createdAt,
              isMembership: b.b_isMembership,
              images: {
                wallpaper: b.wp_id
                  ? {
                      url: b.wp_url,
                      width: b.wp_width,
                      height: b.wp_height,
                      fileSize: b.wp_fileSize,
                    }
                  : null,
                main: b.blog_main_images
                  ? b.blog_main_images.map((i) => {
                      return {
                        url: i.url,
                        width: i.width,
                        height: i.height,
                        fileSize: i.fileSize,
                      };
                    })
                  : [],
              },
              subscribersCount: Number(b.subscribers_count),
              currentUserSubscriptionStatus: b.subscription_status
                ? b.subscription_status
                : SubscriptionStatus.None,
            };
          })
        : [],
    };
  }

  async getSortedBlogsForSpecifiedUser(
    params: BlogsQueryDto,
    userId: string,
  ): Promise<BlogsViewType> {
    const { searchNameTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBlogModel,
      });

    const blogs = await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.blogWallpaper', 'wp')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'fileSize', agg.file_size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, file_size`)
                .from(BlogMainImage, 'bi')
                .where('bi.blogId = b.id');
            }, 'agg'),

        'blog_main_images',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere(`bs.subscriptionStatus = 'Subscribed'`),
        'subscribers_count',
      )
      .addSelect(
        (qb) =>
          qb
            .select('bs.subscriptionStatus')
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere('bs.userId = :userId', { userId }),
        'subscription_status',
      )
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
          userId,
        },
      )
      .andWhere('u.id = :userId', {
        userId,
      })
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(skipSize)
      .getRawMany();

    const blogsCount = await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
          userId,
        },
      )
      .andWhere('u.id = :userId', {
        userId,
      })
      .getCount();

    const pagesCount = getPagesCount(blogsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: blogs.length
        ? blogs.map((b) => {
            return {
              id: b.b_id,
              name: b.b_name,
              description: b.b_description,
              websiteUrl: b.b_websiteUrl,
              createdAt: b.b_createdAt,
              isMembership: b.b_isMembership,
              images: {
                wallpaper: b.wp_id
                  ? {
                      url: b.wp_url,
                      width: b.wp_width,
                      height: b.wp_height,
                      fileSize: b.wp_fileSize,
                    }
                  : null,
                main: b.blog_main_images
                  ? b.blog_main_images.map((i) => {
                      return {
                        url: i.url,
                        width: i.width,
                        height: i.height,
                        fileSize: i.fileSize,
                      };
                    })
                  : [],
              },
              subscribersCount: Number(b.subscribers_count),
              currentUserSubscriptionStatus: b.subscription_status
                ? b.subscription_status
                : SubscriptionStatus.None,
            };
          })
        : [],
    };
  }

  async getSortedBlogsWithUserInfo(
    params: BlogsQueryDto,
  ): Promise<BlogsViewSAType> {
    const { searchNameTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBlogModel,
      });

    const blogs = await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
        },
      )
      .orderBy(`b.${sortBy}`, sortDirection)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    const blogsCount = await this.blogRepository
      .createQueryBuilder('b')
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
        },
      )
      .getCount();

    const pagesCount = getPagesCount(blogsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: blogs.length
        ? blogs.map((b) => {
            return {
              id: b.id,
              name: b.name,
              description: b.description,
              websiteUrl: b.websiteUrl,
              createdAt: b.createdAt,
              isMembership: b.isMembership,
              blogOwnerInfo: {
                userId: b.user ? b.user.id : null,
                userLogin: b.user ? b.user.login : null,
              },
              banInfo: {
                isBanned: b.isBanned,
                banDate: b.banDate,
              },
            };
          })
        : [],
    };
  }
}
