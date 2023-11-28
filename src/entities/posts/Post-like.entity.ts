import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from './Post.entity';

@Entity('postLikes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  likeStatus: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => User, (user) => user.postLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.postLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
