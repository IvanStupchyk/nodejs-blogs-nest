import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './Post.entity';

@Entity('post-images')
export class PostImage {
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

  @ManyToOne(() => Post, (post) => post.postImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(
    url: string,
    width: number,
    height: number,
    fileSize: number,
    post: Post,
  ): PostImage {
    const postImage = new PostImage();
    postImage.url = url;
    postImage.width = width;
    postImage.height = height;
    postImage.fileSize = fileSize;
    postImage.post = post;

    return postImage;
  }
}
