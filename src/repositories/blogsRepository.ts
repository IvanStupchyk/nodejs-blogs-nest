import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogType } from '../domains/blogs/dto/blog.dto';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}
  async createBlog(newBlog: BlogType): Promise<BlogType> {
    const blogInstance = new this.BlogModel();

    blogInstance.id = newBlog.id;
    blogInstance.name = newBlog.name;
    blogInstance.description = newBlog.description;
    blogInstance.websiteUrl = newBlog.websiteUrl;
    blogInstance.createdAt = newBlog.createdAt;
    blogInstance.isMembership = newBlog.isMembership;

    await blogInstance.save();

    return { ...newBlog };
  }

  async updateBlogById(
    id: ObjectId,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result = await this.BlogModel.findOneAndUpdate(
      { id },
      {
        $set: {
          name,
          description,
          websiteUrl,
        },
      },
    );

    return !!result;
  }

  async deleteBlog(id: ObjectId): Promise<boolean> {
    const result = await this.BlogModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }
}
