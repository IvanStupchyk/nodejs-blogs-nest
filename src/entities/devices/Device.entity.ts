import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/User.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @ManyToOne(() => User, (user) => user.device, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
