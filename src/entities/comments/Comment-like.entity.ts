import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './Comment.entity';
import { User } from '../users/User.entity';

@Entity('commentLikes')
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: string;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: Comment;

  @ManyToOne(() => User, (user) => user.commentLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  static create(): CommentLike {
    return new CommentLike();
  }

  static update(
    like: CommentLike,
    likeStatus: string,
    user: User,
    comment: Comment,
  ) {
    like.likeStatus = likeStatus;
    like.user = user;
    like.comment = comment;

    return like;
  }
}
