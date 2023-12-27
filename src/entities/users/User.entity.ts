import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Device } from '../devices/Device.entity';
import { InvalidRefreshToken } from './Invalid-refresh-tokens.entity';
import { PostLike } from '../posts/Post-like.entity';
import { Comment } from '../comments/Comment.entity';
import { CommentLike } from '../comments/Comment-like.entity';
import { Player } from '../game/Player.entity';
import { Blog } from '../blogs/Blog.entity';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserBanInfo } from './User-ban-info.entity';
import { Post } from '../posts/Post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 10 })
  login: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  @Column({ nullable: true, type: 'uuid' })
  confirmationCode: string | null;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expirationDate: Date | null;

  @OneToOne(() => UserBanInfo, (userBanInfo) => userBanInfo.user)
  userBanInfo: UserBanInfo;

  @OneToMany(() => Device, (device) => device.user)
  device: Device[];

  @OneToMany(() => Player, (player) => player.user)
  player: Player[];

  @OneToMany(() => Blog, (blog) => blog.user)
  blog: Blog[];

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLike: PostLike[];

  @OneToMany(
    () => InvalidRefreshToken,
    (invalidRefreshToken) => invalidRefreshToken.user,
  )
  invalidRefreshToken: InvalidRefreshToken[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static createCommonUser(
    login: string,
    email: string,
    passwordHash: string,
  ): User {
    const user = new User();
    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.isConfirmed = false;
    user.confirmationCode = uuidv4();
    user.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    return user;
  }

  static createAdminUser(
    login: string,
    email: string,
    passwordHash: string,
  ): User {
    const user = new User();
    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.isConfirmed = true;

    return user;
  }
}
