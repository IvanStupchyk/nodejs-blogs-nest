import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogViewType } from '../../types/blogs.types';
import { Blog } from '../../entities/blogs/Blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}
  async createBlog(newBlog: Blog): Promise<BlogViewType> {
    const savedBlog = (await this.blogRepository.save(newBlog)) as Blog;

    return {
      id: savedBlog.id,
      name: savedBlog.name,
      // userId: savedBlog.userId,
      description: savedBlog.description,
      websiteUrl: savedBlog.websiteUrl,
      createdAt: savedBlog.createdAt,
      isMembership: savedBlog.isMembership,
    };
  }

  async save(blog: Blog): Promise<boolean> {
    return !!(await this.blogRepository.save(blog));
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogRepository
      .createQueryBuilder('b')
      .delete()
      .from(Blog)
      .where('id = :id', { id })
      .execute();

    return !!result.affected;
  }

  async findBlogById(id: string): Promise<Blog | null> {
    return await this.blogRepository
      .createQueryBuilder('b')
      .where('b.id = :id', {
        id,
      })
      .getOne();
  }

  async deleteAllBlogs(): Promise<boolean> {
    const result = await this.blogRepository
      .createQueryBuilder('b')
      .delete()
      .from(Blog)
      .execute();

    return !!result.affected;
  }
}
