import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './Blog.entity';
import { User } from '../users/User.entity';

@Entity('blog-telegram-subscribers')
export class BlogTelegramSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  activationCode: string;

  @Column({ type: 'bigint', nullable: true })
  telegramId: number;

  @Column({ type: 'varchar' })
  subscriptionStatus: string;

  @ManyToMany(() => Blog, (blog) => blog.blogTelegramSubscribers, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  blogs: Blog[];

  @ManyToOne(() => User, (user) => user.blogTelegramSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
