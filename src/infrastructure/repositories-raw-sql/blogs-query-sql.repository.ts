import { Injectable } from '@nestjs/common';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockBlogModel } from '../../constants/blanks';
import { BlogsType } from '../../types/general.types';
import { GetSortedBlogsModel } from '../../controllers/blogs/models/get-sorted-blogs.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getSortedBlogs(
    params: GetSortedBlogsModel,
    userId?: string,
  ): Promise<BlogsType> {
    const { searchNameTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBlogModel,
      });

    const searchName = searchNameTerm ? `%${searchNameTerm}%` : '%';

    let blogs;
    let blogsCount;

    if (userId) {
      blogs = await this.dataSource.query(
        `
        select "id", "name", "description", "websiteUrl", "isMembership", "createdAt"
        from public.blogs
        where("name" ilike $1)
        and ("userId" = $4)
        order by "${sortBy}" ${sortDirection}
        limit $2 offset $3`,
        [searchName, pageSize, skipSize, userId],
      );

      blogsCount = await this.dataSource.query(
        `
        select "id" "name"
        from public.blogs
        where("name" ilike $1)
        and ("userId" = $2)`,
        [searchName, userId],
      );
    } else {
      blogs = await this.dataSource.query(
        `
        select "id", "name", "description", "websiteUrl", "isMembership", "createdAt"
        from public.blogs
        where("name" ilike $1)
        order by "${sortBy}" ${sortDirection}
        limit $2 offset $3`,
        [searchName, pageSize, skipSize],
      );

      blogsCount = await this.dataSource.query(
        `
        select "id" "name"
        from public.blogs
        where("name" ilike $1)`,
        [searchName],
      );
    }

    const totalBlogsCount = blogsCount.length;
    const pagesCount = getPagesCount(totalBlogsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: totalBlogsCount,
      items: blogs,
    };
  }
}
