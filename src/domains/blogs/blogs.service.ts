import { Injectable } from '@nestjs/common';
import { BlogModel } from './dto/blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/repositories-raw-sql/blogs-sql.repository';
import { isUUID } from '../../utils/utils';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async findBlogById(id: string): Promise<BlogModel | null> {
    if (!isUUID(id)) return null;

    return await this.blogsSqlRepository.findBlogById(id);
  }
}
