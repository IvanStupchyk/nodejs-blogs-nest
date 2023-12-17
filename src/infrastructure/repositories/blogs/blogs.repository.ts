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

  async findBlogById(id: string): Promise<Blog | null> {
    return await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user')
      .where('b.id = :id', {
        id,
      })
      .getOne();
  }
}
