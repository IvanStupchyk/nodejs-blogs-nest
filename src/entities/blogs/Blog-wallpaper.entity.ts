import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './Blog.entity';

@Entity('blog-wallpaper')
export class BlogWallpaper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  url: string;

  @Column({ type: 'integer' })
  width: number;

  @Column({ type: 'integer' })
  height: number;

  @Column({ type: 'integer' })
  fileSize: number;

  @OneToOne(() => Blog, (blog) => blog.blogWallpaper, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(
    url: string,
    width: number,
    height: number,
    fileSize: number,
    blog: Blog,
  ): BlogWallpaper {
    const blogWallpaper = new BlogWallpaper();
    blogWallpaper.url = url;
    blogWallpaper.width = width;
    blogWallpaper.height = height;
    blogWallpaper.fileSize = fileSize;
    blogWallpaper.blog = blog;

    return blogWallpaper;
  }

  static update(
    blogWallpaper: BlogWallpaper,
    url: string,
    width: number,
    height: number,
    fileSize: number,
    blog: Blog,
  ): BlogWallpaper {
    blogWallpaper.url = url;
    blogWallpaper.width = width;
    blogWallpaper.height = height;
    blogWallpaper.fileSize = fileSize;
    blogWallpaper.blog = blog;

    return blogWallpaper;
  }
}
