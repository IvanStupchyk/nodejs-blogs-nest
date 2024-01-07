import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './Blog.entity';
import { User } from '../users/User.entity';

@Entity('blog-subscription')
export class BlogSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  subscriptionStatus: string;

  @ManyToOne(() => Blog, (blog) => blog.blogTelegramSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @Column({ type: 'bigint', nullable: true })
  telegramId: number;

  @ManyToOne(() => User, (user) => user.blogTelegramSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
