import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../schemas/blog.schema';
import { createDefaultSortedParams, getPagesCount } from '../../utils/utils';
import { mockBlogModel } from '../../constants/blanks';
import { BlogType } from '../../domains/blogs/dto/blog.dto';
import { SortOrder } from '../../constants/sort.order';
import { BlogsType } from '../../types/general.types';
import { GetSortedBlogsModel } from '../../controllers/blogs/models/get-sorted-blogs.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}
  async getSortedBlogs(params: GetSortedBlogsModel): Promise<BlogsType> {
    const { searchNameTerm } = params;

    const { pageNumber, pageSize, skipSize, sortBy, sortDirection } =
      createDefaultSortedParams({
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        model: mockBlogModel,
      });

    const findCondition = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const blogsMongoose = await this.BlogModel.find(findCondition, {
      _id: 0,
      __v: 0,
    })
      .sort({ [sortBy]: sortDirection === SortOrder.asc ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .exec();

    const blogsCount = await this.BlogModel.countDocuments(findCondition);
    const pagesCount = getPagesCount(blogsCount, pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: [...blogsMongoose],
    };
  }

  async findBlogById(id: ObjectId): Promise<BlogType | null> {
    return await this.BlogModel.findOne({ id }, { _id: 0, __v: 0 }).exec();
  }
}
