import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "../posts/Post.entity";
import { User } from "../users/User.entity";
import { CommentLike } from "./Comment-like.entity";
import { exceptionHandler } from "../../utils/errors/exception.handler";
import { HttpStatus } from "@nestjs/common";

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

  static create(content: string, user: User, post: Post) {
    const comment = new Comment();

    comment.content = content;
    comment.user = user;
    comment.post = post;

    return comment;
  }

  static update(comment: Comment | null, content: string, userId: string) {
    if (!comment) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    }

    if (comment && comment.user.id !== userId) {
      return exceptionHandler(HttpStatus.FORBIDDEN);
    }

    comment.content = content;

    return comment;
  }
}
