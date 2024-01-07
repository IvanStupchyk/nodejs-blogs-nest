import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogSubscription } from '../../../entities/blogs/Blog-subscription.entity';

@Injectable()
export class BlogSubscribersRepository {
  constructor(
    @InjectRepository(BlogSubscription)
    private readonly blogTelegramSubscriber: Repository<BlogSubscription>,
  ) {}
  async findSubscriberByUserId(
    userId: string,
  ): Promise<BlogSubscription | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'user')
      .leftJoinAndSelect('sb.blog', 'blog')
      .where('user.id = :userId', { userId })
      .getOne();
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

  async findSubscribersByBlogId(
    blogId: string,
  ): Promise<BlogSubscription[] | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.blog', 'blog')
      .where('blog.id = :blogId', { blogId })
      .getMany();
  }
}
