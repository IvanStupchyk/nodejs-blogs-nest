import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogSubscription } from '../../../entities/blogs/Blog-subscription.entity';

@Injectable()
export class BlogSubscribersRepository {
  constructor(
    @InjectRepository(BlogSubscription)
    private readonly blogTelegramSubscriber: Repository<BlogSubscription>,
  ) {}
  async findSubscribersByUserId(
    userId: string,
  ): Promise<BlogSubscription[] | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'user')
      .leftJoinAndSelect('sb.blog', 'blog')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findSubscriberByUserIdAndBlogId(
    userId: string,
    blogId: string,
  ): Promise<BlogSubscription | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'user')
      .leftJoinAndSelect('sb.blog', 'blog')
      .where('user.id = :userId', { userId })
      .andWhere('blog.id = :blogId', { blogId })
      .getOne();
  }

  async findActiveSubscribersByBlogId(
    blogId: string,
  ): Promise<BlogSubscription[] | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.blog', 'blog')
      .leftJoinAndSelect('sb.user', 'user')
      .where('blog.id = :blogId', { blogId })
      .andWhere(`sb.subscriptionStatus = 'Subscribed'`, { blogId })
      .getMany();
  }
}
