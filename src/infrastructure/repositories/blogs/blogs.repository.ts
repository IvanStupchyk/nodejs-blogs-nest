import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

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
}
