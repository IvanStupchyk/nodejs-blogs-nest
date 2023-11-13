import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { BlogType } from './dto/blog.dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async findBlogById(id: string): Promise<BlogType | null> {
    if (!ObjectId.isValid(id)) return null;
    return await this.blogsRepository.findBlogById(new ObjectId(id));
  }
}
