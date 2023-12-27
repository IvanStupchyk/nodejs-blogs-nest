import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('users_ban_info')
export class UserBanInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false, type: 'boolean' })
  isBanned: boolean;

  @Column({ nullable: true, type: 'varchar' })
  banReason: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  banDate: Date;

  @OneToOne(() => User, (user) => user.userBanInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(user: User): UserBanInfo {
    const banInfo = new UserBanInfo();
    banInfo.isBanned = false;
    banInfo.user = user;

    return banInfo;
  }
}
