import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './Comment.entity';
import { User } from '../users/user.entity';

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
}
