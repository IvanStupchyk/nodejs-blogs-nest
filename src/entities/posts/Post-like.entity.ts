import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/User.entity';
import { Post } from './Post.entity';

@Entity('postLikes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: string;

  @Column({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => User, (user) => user.postLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.postLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create() {
    return new PostLike();
  }

  static update(like: PostLike, likeStatus: string, post: Post, user: User) {
    like.likeStatus = likeStatus;
    like.post = post;
    like.user = user;
    like.addedAt = new Date();
  }
}
