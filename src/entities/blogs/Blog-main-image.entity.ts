import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './Blog.entity';

@Entity('blog-main-images')
export class BlogMainImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  url: string;

  @Column({ type: 'integer' })
  width: number;

  @Column({ type: 'integer' })
  height: number;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize: number;

  @ManyToOne(() => Blog, (blog) => blog.blogMainImages, {
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
  ): BlogMainImage {
    const blogImage = new BlogMainImage();
    blogImage.url = url;
    blogImage.width = width;
    blogImage.height = height;
    blogImage.fileSize = fileSize;
    blogImage.blog = blog;

    return blogImage;
  }
}
