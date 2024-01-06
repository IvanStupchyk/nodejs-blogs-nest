import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogImagesViewType } from '../../../types/blogs/blog.images.types';
import { BlogWallpaper } from '../../../entities/blogs/Blog-wallpaper.entity';
import { BlogTelegramSubscriber } from '../../../entities/blogs/Blog-telegram-subscriber.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BlogSubscribersRepository {
  constructor(
    @InjectRepository(BlogTelegramSubscriber)
    private readonly blogTelegramSubscriber: Repository<BlogTelegramSubscriber>,
  ) {}
  async findSubscriberByUserId(
    userId: string,
  ): Promise<BlogTelegramSubscriber | null> {
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
  ): Promise<BlogTelegramSubscriber | null> {
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
  ): Promise<BlogTelegramSubscriber[] | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.blog', 'blog')
      .where('blog.id = :blogId', { blogId })
      .getMany();
  }

  async findSubscriberByActivationCode(
    activationCode: string,
  ): Promise<BlogTelegramSubscriber | null> {
    return await this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .where('sb.activationCode = :activationCode', { activationCode })
      .getOne();
  }

  async findSubscriberByTelegramId(
    telegramId: number,
  ): Promise<BlogTelegramSubscriber | null> {
    return this.blogTelegramSubscriber
      .createQueryBuilder('sb')
      .where('sb.telegramId = :telegramId', { telegramId })
      .getOne();
  }
}
