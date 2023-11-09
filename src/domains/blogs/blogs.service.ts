import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs.query.repository';
import { BlogType } from './dto/blog.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogType> {
    const newBlog: BlogType = new BlogType(
      new ObjectId(),
      name,
      description,
      websiteUrl,
      new Date().toISOString(),
      false,
    );

    return await this.blogsRepository.createBlog(newBlog);
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return null;

    return await this.blogsRepository.updateBlogById(
      new ObjectId(id),
      name,
      description,
      websiteUrl,
    );
  }

  async findBlogById(id: string): Promise<BlogType | null> {
    if (!ObjectId.isValid(id)) return null;
    return await this.blogsQueryRepository.findBlogById(new ObjectId(id));
  }

  async deleteBlog(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return null;
    return await this.blogsRepository.deleteBlog(new ObjectId(id));
  }
}
