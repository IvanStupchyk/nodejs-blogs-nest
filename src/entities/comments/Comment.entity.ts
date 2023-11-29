import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../posts/Post.entity';
import { User } from '../users/user.entity';
import { CommentLike } from './Comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 300 })
  content: string;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  commentLikes: CommentLike[];

  @ManyToOne(() => User, (user) => user.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
