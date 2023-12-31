import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogMainImage } from '../../../entities/blogs/Blog-main-image.entity';
import { BlogSubscription } from '../../../entities/blogs/Blog-subscription.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async findBlogById(id: string, userId?: string): Promise<any | null> {
    return await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('b.blogWallpaper', 'wp')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'fileSize', agg.file_size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, file_size`)
                .from(BlogMainImage, 'bi')
                .where('bi.blogId = b.id');
            }, 'agg'),

        'blog_images',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere(`bs.subscriptionStatus = 'Subscribed'`),
        'subscribers_count',
      )
      .addSelect(
        (qb) =>
          qb
            .select('bs.subscriptionStatus')
            .from(BlogSubscription, 'bs')
            .where('bs.blogId = b.id')
            .andWhere('bs.userId = :userId', { userId }),
        'subscription_status',
      )
      .where('b.id = :id', {
        id,
      })
      .getRawOne();
  }
}
