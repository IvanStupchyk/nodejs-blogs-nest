import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../../utils/utils';
import { mockBlogModel } from '../../../constants/blanks';
import { BlogsQueryDto } from '../../../dto/blogs/blogs.query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsViewSAType, BlogsViewType } from '../../../types/blogs.types';
import { Blog } from '../../../entities/blogs/Blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async getSortedBlogs(params: BlogsQueryDto): Promise<BlogsViewType> {
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
      .skip(skipSize)
      .take(pageSize)
      .getMany();

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
              id: b.id,
              name: b.name,
              description: b.description,
              websiteUrl: b.websiteUrl,
              createdAt: b.createdAt,
              isMembership: b.isMembership,
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
            };
          })
        : [],
    };
  }
}
