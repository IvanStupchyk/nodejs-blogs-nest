import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Device } from '../devices/device.entity';
import { InvalidRefreshToken } from './invalid-refresh-tokens.entity';
import { PostLike } from '../posts/Post-like.entity';

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

  @OneToMany(() => Device, (device) => device.user)
  device: Device[];

  // @OneToMany(() => Blog, (blog) => blog.user)
  // blog: Blog[];

  // @OneToMany(() => Post, (post) => post.user)
  // post: Post[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLike: PostLike[];

  @OneToMany(
    () => InvalidRefreshToken,
    (invalidRefreshToken) => invalidRefreshToken.user,
  )
  invalidRefreshToken: InvalidRefreshToken[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
