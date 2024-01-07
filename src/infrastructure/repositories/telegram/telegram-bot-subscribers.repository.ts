import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/Blog.entity';
import { BlogImagesViewType } from '../../../types/blogs/blog.images.types';
import { BlogWallpaper } from '../../../entities/blogs/Blog-wallpaper.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogSubscription } from '../../../entities/blogs/Blog-subscription.entity';
import { TelegramBotSubscriber } from '../../../entities/telegram/Telegram-bot-subscriber.entity';

@Injectable()
export class TelegramBotSubscribersRepository {
  constructor(
    @InjectRepository(TelegramBotSubscriber)
    private readonly telegramBotSubscriber: Repository<TelegramBotSubscriber>,
  ) {}
  async findSubscriberByUserId(
    userId: string,
  ): Promise<TelegramBotSubscriber | null> {
    return await this.telegramBotSubscriber
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findSubscriberByActivationCode(
    activationCode: string,
  ): Promise<TelegramBotSubscriber | null> {
    return await this.telegramBotSubscriber
      .createQueryBuilder('sb')
      .where('sb.activationCode = :activationCode', { activationCode })
      .getOne();
  }

  async findSubscriberByTelegramId(
    telegramId: number,
  ): Promise<TelegramBotSubscriber | null> {
    return this.telegramBotSubscriber
      .createQueryBuilder('sb')
      .where('sb.telegramId = :telegramId', { telegramId })
      .getOne();
  }

  // async findSubscriberByUserIdAndBlogId(
  //   userId: string,
  //   blogId: string,
  // ): Promise<BlogSubscription | null> {
  //   return await this.blogTelegramSubscriber
  //     .createQueryBuilder('sb')
  //     .leftJoinAndSelect('sb.user', 'user')
  //     .leftJoinAndSelect('sb.blog', 'blog')
  //     .where('user.id = :userId', { userId })
  //     .andWhere('blog.id = :blogId', { blogId })
  //     .getOne();
  // }
  //
  // async findSubscribersByBlogId(
  //   blogId: string,
  // ): Promise<BlogSubscription[] | null> {
  //   return await this.blogTelegramSubscriber
  //     .createQueryBuilder('sb')
  //     .leftJoinAndSelect('sb.blog', 'blog')
  //     .where('blog.id = :blogId', { blogId })
  //     .getMany();
  // }
}
