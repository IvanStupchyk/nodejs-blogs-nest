import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Blog } from '../blogs/Blog.entity';

@Entity('user_ban_by_blogger')
export class UserBanByBlogger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false, type: 'boolean' })
  isBanned: boolean;

  @Column({ nullable: true, type: 'varchar' })
  banReason: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  banDate: Date;

  @OneToOne(() => User, (user) => user.userBanByBlogger, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.userBanByBlogger, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(user: User): UserBanByBlogger {
    const banInfo = new UserBanByBlogger();
    banInfo.isBanned = false;
    banInfo.user = user;

    return banInfo;
  }
}
