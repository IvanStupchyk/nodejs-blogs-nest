import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../blogs/Blog.entity';
import { PostLike } from './Post-like.entity';
import { Comment } from '../comments/Comment.entity';
import { exceptionHandler } from '../../utils/errors/exception.handler';
import { HttpStatus } from '@nestjs/common';
import { User } from '../users/User.entity';
import { PostImage } from './Post-image.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 30 })
  title: string;

  @Column({ type: 'varchar', width: 100 })
  shortDescription: string;

  @Column({ type: 'varchar', width: 1000 })
  content: string;

  @ManyToOne(() => User, (user) => user.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @Column({ type: 'varchar' })
  blogName: string;

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  postImages: PostImage[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(
    title: string,
    content: string,
    shortDescription: string,
    blogName: string,
    blog: Blog,
    user: User,
  ): Post {
    const post = new Post();
    post.title = title;
    post.content = content;
    post.shortDescription = shortDescription;
    post.blogName = blogName;
    post.blog = blog;
    post.user = user;

    return post;
  }

  static update(
    blog: Blog | null,
    post: Post,
    title: string,
    content: string,
    shortDescription: string,
    userId: string,
  ) {
    if (blog && blog.user && blog.user.id !== userId) {
      return exceptionHandler(HttpStatus.FORBIDDEN);
    }
    if (!blog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    post.title = title;
    post.content = content;
    post.shortDescription = shortDescription;

    return post;
  }
}
