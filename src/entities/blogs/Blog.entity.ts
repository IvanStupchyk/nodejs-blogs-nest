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
import { User } from '../users/User.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 15 })
  name: string;

  @Column({ type: 'varchar', width: 500 })
  description: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @ManyToOne(() => User, (user) => user.blog, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  // @Column({ type: 'uuid', nullable: true })
  // userId: string;

  @OneToMany(() => Post, (post) => post.blog)
  post: Post[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
