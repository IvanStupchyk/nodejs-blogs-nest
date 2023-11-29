import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockBlogModel } from '../../constants/blanks';
import { BlogsQueryDto } from '../../dto/blogs/blogs.query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsViewType } from '../../types/blogs.types';
import { Blog } from '../../entities/blogs/Blog.entity';

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
      .where(
        `${searchNameTerm ? `(b.name ilike :name)` : 'b.name is not null'}`,
        {
          name: `%${searchNameTerm}%`,
          userId,
        },
      )
      // .andWhere(`${userId ? `(b.userId = :userId)` : 'b.userId is not null'}`, {
      //   userId,
      // })
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
          userId,
        },
      )
      // .andWhere(`${userId ? `(b.userId = :userId)` : 'b.userId is not null'}`, {
      //   userId,
      // })
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
}
